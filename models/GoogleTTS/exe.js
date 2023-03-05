// Imports the Google Cloud client library
const textToSpeech = require('@google-cloud/text-to-speech');

// Import other required libraries
const fs = require('fs');
const util = require('util');

const client = new textToSpeech.TextToSpeechClient();  
async function execute(parameters) {
    // The text to synthesize
    const text = parameters.text;

    // Construct the request
    const request = {
        input: {text: text},
        voice: {languageCode: parameters.configuration.languageCode, name: parameters.configuration.speakerName},
        // select the type of audio encoding
        audioConfig: {audioEncoding: 'MP3'},
    };

    // Performs the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);
    return response.audioContent;
}

module.exports = {
    execute
};

