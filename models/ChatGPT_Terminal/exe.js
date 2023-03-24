const { Configuration, OpenAIApi } = require("openai");
const fs = require('fs');

function decodeEntities(encodedString) {
    var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    var translate = {
        "nbsp":" ",
        "amp" : "&",
        "quot": "\"",
        "lt"  : "<",
        "gt"  : ">"
    };
    return encodedString.replace(translate_re, function(match, entity) {
        return translate[entity];
    }).replace(/&#(\d+);/gi, function(match, numStr) {
        var num = parseInt(numStr, 10);
        return String.fromCharCode(num);
    });
}

async function execute(parameters, res) {

    if(parameters.commandExecution == "True"){

        // Get Last message
        command = parameters.messages[parameters.messages.length-1].content.split("--Note:")[0].split("--Output:")[0];
        if(command.includes("--Action--Command:")){
            commands = command.split("--Action--Command:")
            for (let i = 1; i < commands.length; i++) {
                command = commands[i];
                command = command.replace(/<br>/g,"\r\n")
                command = decodeEntities(command)
                command = command.split("--End-Of-Action")[0]
                //.split("--End-Of-Action")[0]
                complexCommand = ""
                if(command.includes("```")){
                    commandSplit = command.split("```")
                    for (let i = 1; i < commandSplit.length; i++) {
                        singleCommand = commandSplit[i].split("```");
                        if(i!=1){
                            complexCommand += " && "    
                        }
                        complexCommand += singleCommand + "\r\n ";
                    }
                    command = complexCommand
                }
                
                timeoutTimer = setTimeout(function() {
                    res.write("The command is either still running or CMD expects further input. You might have to exit the current CLI.");
                    res.end();
                }, 15000);
                terminal = require('child_process').spawn('cmd.exe', { timeout : 1000*60, cwd: devDirectory });
                terminal.on('close', (code) => {
                    console.log(`child process exited with code ${code}`);
                    clearTimeout(timeoutTimer)
                    res.end()
                });

                global.terminal = terminal;
                console.log("run command: " + command)
                executeCMDCommand(command, res, timeoutTimer)
            }
            
            
        }else if(command.includes("--Action--File:")){
            commands = command.split("--Action--File:")
            for (let i = 1; i < commands.length; i++) {
                command = commands[i].split("--End-Of-Action")[0];
                pathToFile = command.split("--")[0].split("<br>")[0].trim()
                textToWrite = command.split( pathToFile)[1]

                if(textToWrite != undefined){
                    textToWrite = textToWrite.replace(/```/g,"")
                    textToWrite = textToWrite.replace(/^--/g,"")
                    textToWrite = textToWrite.replace(/<br>/g,"\r\n")
                    textToWrite = decodeEntities(textToWrite)

                }else{
                    textToWrite = ""
                }
                if(pathToFile.includes(devDirectory + "\\")){
                    pathToFile = pathToFile.replace(devDirectory+"\\","")
                }

                fs.writeFile(devDirectory + "/" + pathToFile, textToWrite, err => {
                    if (err) {
                        res.write("Writing to File "+pathToFile+" failed: "+err)
                        res.end()
                    }else{
                        res.write("Writing successful!")
                        res.end()
                    }
                  });
            }
        }else{
            res.end("No command to execute!")
        }
    }else{

        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        //console.log(parameters)
        messages = [{"role": "system", "content": parameters.configuration.instruction}]
        messages = messages.concat(parameters.messages)
        const openai = new OpenAIApi(configuration);

        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: parseFloat(parameters.configuration.temperature),
            max_tokens: parseFloat(parameters.configuration.maxTokens)
        });
        
        return response.data;
    }
}

function executeCMDCommand(command, res, timeoutTimer){

    terminal.stdout.setEncoding('utf8');
    terminal.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
        if(!data.toString().includes("Microsoft Corporation")){
            dataToWrite = data.toString().replace(devDirectory,"")
            if(dataToWrite != ">"){
                res.write(dataToWrite)
            }
        }

        const regexExpectingCommand = />$/g;
        const foundCommand = data.toString().match(regexExpectingCommand);
        if (foundCommand) {
            devDirectory = data.toString().split(">")[data.toString().split(">").length-2].split("\r\n")[data.toString().split(">")[data.toString().split(">").length-2].split("\r\n").length-1]
            console.log("Set Dev directory: "+devDirectory)
            //clearTimeout(timeoutTimer)
            //res.end();
          }
    });
    terminal.stderr.setEncoding('utf8');
    terminal.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
        res.write(data)

        const regex = />$/g;
        const found = data.toString().match(regex);
        if (found) {
            //clearTimeout(timeoutTimer)
            devDirectory = data.toString().split(">")[data.toString().split(">").length-2].split("\r\n")[data.toString().split(">")[data.toString().split(">").length-2].split("\r\n").length-1]
            console.log("Set Dev directory: "+devDirectory)
            //res.end();
          }
    });
    terminal.stdin.write(Buffer.from(command + '\r\n'));
    terminal.stdin.end();

}

function executeCMDCommandvenv(){
    
}


module.exports = {
    execute
};

