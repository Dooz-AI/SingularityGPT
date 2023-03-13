const { Configuration, OpenAIApi } = require("openai");

async function execute(parameters) {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    //console.log(parameters)
    messages = [{"role": "system", "content": parameters.configuration.instruction}]
    messages = messages.concat(parameters.messages)
    console.log(parseFloat(parameters.configuration.temperature))
    console.log(parseFloat(parameters.configuration.maxTokens))
    const openai = new OpenAIApi(configuration);
    try {
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: parseFloat(parameters.configuration.temperature),
            max_tokens: parseFloat(parameters.configuration.maxTokens)
        });
        //console.log(response);
        return response.data;
    } catch (error) {
        return { message: error.message, status: error.response.status, statusText: error.response.statusText };
    }
}

module.exports = {
    execute
};

