const request = require('request');
const fs = require('fs');

async function execute(parameters) {

    const formData = {
        file: {
            value: parameters,
            options: {
                filename: 'audio.mp3',
                contentType: 'audio/mp3',
            },
        },
        model: 'whisper-1',
        language: 'en'
    };
    //console.log(formData);
    // Send the audio file and model name to the API using request
    return new Promise((resolve, reject) => {
        request.post(
            {
                url: 'https://api.openai.com/v1/audio/transcriptions',
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'multipart/form-data',
                },
                formData: formData,
            },
            (err, res, body) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(body);
                }
            }
        );
    });
}

module.exports = {
    execute
};

