transcriberModels = []
generativeModels = []
synthesizerModels = []

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }
  
conversationID = uuidv4();
newChat=true;

function sortObj(object, property){
    return object.sort((a,b) => {
        if(a[property] > b[property]) {
            return 1;
        }
        if (a[property] < b[property]) {
            return -1;
        }
        return 0;
    })
}

const slideableDiv = document.getElementById('slideable-div');
const slideLeftButton = document.getElementById('slide-left-button');

slideLeftButton.addEventListener('click', () => {
  slideableDiv.classList.toggle('offscreen');
});

function getPreviousConversations(){
    const xhr = new XMLHttpRequest();
    const url = "/api/exe";
    xhr.open("GET", url);
    xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
        response = JSON.parse(this.responseText)

        

        if(response.length>0){
            conversationContainer = document.getElementById("previousConversationContainer")
            conversationContainer.innerHTML= ""

            conversationsHTML = ""
            for (let i = 0; i < response.length; i++) {
                const previousConversation = response[i];

                conversationsHTML += `
                <a class="list-group-item list-group-item-action py-3 lh-sm" aria-current="true" onclick="loadPreviousConversation('${previousConversation.Id}')">
                    <div class="d-flex w-100 align-items-center justify-content-between">
                        <strong class="mb-1">${previousConversation.name}</strong>
                        <small onclick="deletePreviousConversation('${previousConversation.Id}')" style="cursor: pointer;">X</small>
                    </div>
                </a>
                `
            }
            conversationContainer.innerHTML= conversationsHTML
        }
    }
    };
    xhr.send();
}
getPreviousConversations();

function loadPreviousConversation(conversationId){
    const xhr = new XMLHttpRequest();
    const url = "/api/exe?Id="+conversationId;
    xhr.open("GET", url);
    xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
        response = JSON.parse(this.responseText)
        messages = JSON.parse(response[0].messages)
        conversationID =response[0].Id;
        $(".chat-messages")[0].innerHTML = "";
        for (let i = 0; i < messages.length; i++) { 
            const message = messages[i];    
            role="sent"
            if(message.role=="assistant"){
                role="received"
            }
            addMessage(role, message.content);
        }
        newChat = false;
    }
    };
    xhr.send();
}

function deletePreviousConversation(conversationId){
    const xhr = new XMLHttpRequest();
    const url = "/api/exe?Id="+conversationId;
    xhr.open("DELETE", url);
    xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
        getPreviousConversations();
    }
    };
    xhr.send();
}

function getModels(){
    const xhr = new XMLHttpRequest();
    const url = "/api/models";
    xhr.open("GET", url);
    xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
        models = JSON.parse(xhr.responseText);

        for (let i = 0; i < models.length; i++) {
            const modelName = models[i];
            modelConfiguration = JSON.parse(Cookies.get(`configuration ${modelName}`))
            switch(modelConfiguration.modelType){
                case "Transcriber":
                    transcriberModels.push({modelName: modelName, priority: modelConfiguration.priority})
                    break
                case "Generator":
                    generativeModels.push({modelName: modelName, priority: modelConfiguration.priority})
                    break
                case "Synthesizer":
                    synthesizerModels.push({modelName: modelName, priority: modelConfiguration.priority})
                    break
                default:
                    console.log(`Incorrect Model: ${modelName}`)
                    break
            }
            transcriberModels = sortObj(transcriberModels,"priority")
            generativeModels = sortObj(generativeModels,"priority")
            synthesizerModels = sortObj(synthesizerModels,"priority")

        }
    }
    };
    xhr.send();
}
getModels();

function submitMessage(event){
    event.preventDefault(); // Prevent form submission
    var message = $(".form-control").val(); // Get the message from the input field
    if (message.trim() !== "") { // Check if the message is not empty
        addMessage("sent", message); // Add the message to the chat
        $(".form-control").val(""); // Clear the input field
        executeGenerativeModels();
    }
}

// Function to add a message to the chat
function addMessage(type, message) {
    var chatMessageContainer = $("<div class='message-container'></div>");
    var chatMessage = $("<div class='chat-message col-md-8'></div>");
    chatMessage.addClass(type);

    //format message for better display
    
    //message = htmlEncode(message)
    message = highlightCode(message)
    message = message.replace(/\n/g, "<br>");
    

    chatMessage.html(message);
    chatMessageContainer.append(chatMessage);
    $(".chat-messages").append(chatMessageContainer);

    chatElemenet = document.getElementsByClassName("chat-messages")[0]
    chatElemenet.scrollTop = chatElemenet.scrollHeight;
}


  function highlightCode(message) {
    // Define the regular expression to match code sections
    const codeRegex = /```(.+?)```/gs;
  
    // Initialize the updated message
    let updatedMessage = '';
  
    // Iterate over the matches of the codeRegex in the message
    let match;
    let lastIndex = 0;
    while ((match = codeRegex.exec(message)) !== null) {
      // Encode the text before the match and append it to the updated message
      const preMatch = message.substring(lastIndex, match.index);
      const encodedPreMatch = preMatch.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      updatedMessage += encodedPreMatch;
  
      // Use PrismJS to highlight the code section and wrap it in a <pre><code> block
      const language = 'javascript';
      const code = match[1].trim();
      const highlightedCode = Prism.highlight(code, Prism.languages[language], language);
      const wrappedCode = `<pre class="language-${language}"><code>${highlightedCode}</code></pre>`;
  
      // Append the wrapped code to the updated message
      updatedMessage += wrappedCode;
  
      // Update the lastIndex to the end of the match
      lastIndex = codeRegex.lastIndex;
    }
  
    // Encode the remaining text after the last match and append it to the updated message
    const remainingText = message.substring(lastIndex);
    const encodedRemainingText = remainingText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    updatedMessage += encodedRemainingText;
  
    // Return the updated message with highlighted code sections and encoded text
    return updatedMessage;
  }

function executeGenerativeModels(){
    allChatMessages = $(".chat-messages").find(".chat-message")
    parsedChatMessages = []
    for (let i = 0; i < allChatMessages.length; i++) {
        const chatMessage = allChatMessages[i];
        if(chatMessage.classList.contains("sent")){
            role = "user"
        }else{
            role = "assistant"
        }
        content = chatMessage.innerText

        parsedChatMessages.push({"role": role, "content": content})
    }

    completedGenerativeModels = 0
    for (let i = 0; i < generativeModels.length; i++) {
        const generativeModel = generativeModels[i];
        
        executionBody = {configuration: JSON.parse(Cookies.get(`configuration ${generativeModel.modelName}`)), messages: parsedChatMessages, conversationID: conversationID}
        
        const xhr = new XMLHttpRequest();
        const url = "/api/exe?model="+generativeModel.modelName;
        xhr.open("POST", url);
        xhr.setRequestHeader("Content-Type","application/json")
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4){
                completedGenerativeModels++
                if(xhr.status === 200) {
                    response = JSON.parse(this.responseText)
                    message = response.choices[0].message.content

                    

                    addMessage("received", message)
                }
                if(completedGenerativeModels == generativeModels.length){
                    if(newChat){
                        getPreviousConversations();
                        newChat=false;
                    }
                    executeSynthesizerModels(message);
                }
            }
            if (xhr.readyState === 4){
                console.log(this.responseText);
            }
            console.log(xhr.readyState)
        };
        xhr.send(JSON.stringify(executionBody));

    }
    
}

function executeSynthesizerModels(textToSynth){
    completedSynthesizerModels = 0
    for (let i = 0; i < synthesizerModels.length; i++) {
        const synthesizerModel = synthesizerModels[i];
        
        executionBody = {configuration: JSON.parse(Cookies.get(`configuration ${synthesizerModel.modelName}`)), text: textToSynth}
        
        const xhr = new XMLHttpRequest();
        const url = "/api/exe?model="+synthesizerModel.modelName;
        xhr.open("POST", url);
        xhr.setRequestHeader("Content-Type","application/json")
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4){
                completedSynthesizerModels++
                if(xhr.status === 200) {
                    response = JSON.parse(this.responseText)

                    const uint8Array = new Uint8Array(response.data);

                    // Convert the Uint8Array to a Blob object
                    const blob = new Blob([uint8Array], { type: 'audio/mp3' });

                    // Create an audio element and set the source to the Blob object
                    const audioElement = new Audio(URL.createObjectURL(blob));
                    audioElement.addEventListener('ended', () => {
                        URL.revokeObjectURL(audioElement.src);
                    });

                    // Play the audio
                    audioElement.play();
                }
            }
        };
        xhr.send(JSON.stringify(executionBody));

    }
    
}

function executeCMDCommand(){
    allChatMessages = $(".chat-messages").find(".chat-message")
    parsedChatMessages = []
    for (let i = 0; i < allChatMessages.length; i++) {
        const chatMessage = allChatMessages[i];
        if(chatMessage.classList.contains("sent")){
            role = "user"
        }else{
            role = "assistant"
        }
        content = chatMessage.innerHTML

        parsedChatMessages.push({"role": role, "content": content})
    }

    const generativeModel = generativeModels[0];
        
    executionBody = {configuration: JSON.parse(Cookies.get(`configuration ${generativeModel.modelName}`)), messages: parsedChatMessages, conversationID: conversationID, commandExecution: "True"}
    
    const xhr = new XMLHttpRequest();
    const url = "/api/exe?model="+generativeModel.modelName;
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type","application/json")
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4){
            if(xhr.status === 200) {
                response = this.responseText
                //addMessage("sent", response)
                $(".form-control").val(response);
                //console.log(response)
                //executeGenerativeModels();
            }
        }
    };
    xhr.send(JSON.stringify(executionBody));

}


// Get the record and stop button elements
const recordButton = document.getElementById('recordButton');
const stopButton = document.getElementById('stopButton');

// Initialize variables for the MediaStream and MediaRecorder objects
let stream, mediaRecorder;

// Initialize an array to store the recorded audio chunks
chunks = [];

// Add a click event listener to the record button
recordButton.addEventListener('click', () => {
  // Request permission to access the user's microphone

  chunks = [];
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then((userStream) => {
      // Save the MediaStream object for later use
      stream = userStream;

      console.log("hello")
      // Create a new MediaRecorder object to record the audio stream
      mediaRecorder = new MediaRecorder(stream);

      // Start recording
      transcriberModelConfiguration = JSON.parse(Cookies.get(`configuration ${transcriberModels[0].modelName}`))
      if(transcriberModelConfiguration.continuousRecording){
        mediaRecorder.start(transcriberModelConfiguration.recordingLength);
      }else{
        mediaRecorder.start();
      }
      

      // Enable the stop button and disable the record button
      stopButton.style.display = "block";
      recordButton.style.display = "none";

      // Add a data available event listener to the MediaRecorder
      mediaRecorder.addEventListener('dataavailable', (event) => {
        // Push the recorded audio chunk to the chunks array
        console.log(event.data)
        chunks.push(event.data);
        ProcessAudioChunk();
      });
    })
    .catch((error) => {
      console.error(error);
    });
});

function ProcessAudioChunk(){
    //console.log(chunks)
    const blob = new Blob(chunks, { type: 'audio/mp3' });
    
    //console.log(blob)

    completedTranscriberModels = 0
    for (let i = 0; i < transcriberModels.length; i++) {
        const transcriberModel = transcriberModels[i];
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/exe?model='+transcriberModel.modelName);
        xhr.setRequestHeader('Content-Type', 'audio/mp3');
        xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            if (xhr.readyState === 4){
                completedTranscriberModels++
                if(xhr.status === 200) {
                    response = JSON.parse(JSON.parse(this.responseText))
                    console.log(response)
                    if(response.text != undefined){
                        $(".form-control")[0].value=response.text
                    }
                }
            }
        }
        };
        xhr.send(blob);
    }
}

// Add a click event listener to the stop button
stopButton.addEventListener('click', () => {
   // Stop recording
   mediaRecorder.stop();

   // Stop the MediaStream object
   stream.getTracks().forEach((track) => {
     track.stop();
   });

   recordButton.style.display = "block";
   stopButton.style.display = "none";
});