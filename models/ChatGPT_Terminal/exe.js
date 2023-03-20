const { Configuration, OpenAIApi } = require("openai");

async function execute(parameters, res) {

    if(parameters.commandExecution == "True"){

        // Get Last message
        command = parameters.messages[parameters.messages.length-1].content.split("--Note:")[0].split("--Output:")[0];
        if(command.includes("--Command:")){
            command = command.split("--Command:")[1].split("--End-Of-Command")[0]

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

            console.log("run command: " + command)
            executeCMDCommand(command, res, timeoutTimer)
            
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

function executeCMDCommand(command, res){

    terminal.stdout.setEncoding('utf8');
    terminal.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
        res.write(data)

        const regexExpectingCommand = />$/g;
        const foundCommand = data.toString().match(regexExpectingCommand);
        if (foundCommand) {
            clearTimeout(timeoutTimer)
            res.end();
          }
    });
    terminal.stdio.on('data', function(data){
        console.log("stdio: " + data);
    })
    terminal.stderr.setEncoding('utf8');
    terminal.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
        res.write(data)

        const regex = />$/g;
        const found = data.toString().match(regex);
        if (found) {
            clearTimeout(timeoutTimer)
            res.end();
          }
    });

    terminal.stdin.write(Buffer.from(command + '\r\n'));

}


module.exports = {
    execute
};

