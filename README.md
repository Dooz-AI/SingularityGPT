# voi-to-voi
Small Framework for linking different AI models to create a Voice-To-Voice interface.
![image](https://user-images.githubusercontent.com/44745172/222991112-f3c6df88-1d6d-4cb7-a22b-5274fa5ebc89.png)

The app uses NodeJS for the backend, Express for the API, SQLite for the database and Bootstrap for the frontend.

By default the app is configure to use the **Whisper** model from OpenAI from Speech-to-Text, **ChatGPT** model also from OpenAI to generate a response, and **Google Cloud** for the Text-To-Speech.

To run the app with these models, you'll have to provide your own API keys. Instructions on how to aquire them can be found below.

Besides these, adding and configuring new models can be quickly done through the defined steps.

## Setup

1. If you don’t have Node.js installed, [install it from here](https://nodejs.org/en/) (Node.js version >= 14.6.0 required)

2. Clone this repository

3. Navigate into the project directory

```
$ cd voi-to-voi
```

4. Install the requirements

```
$ npm install
```

5. Make a copy of the example environment variables file

On Linux systems:

```
$ cp .env.example .env
```
On Windows:

```
$ copy .env.example .env
```

6. Add your API keys to the newly created .env file. In the case of the Google Cloud API Keys, point to the file where the API keys are saved.
  - If you don't have API keys for OpenAI or Google Cloud but you still want to use their models, you can get their API keys here:
    - [OpenAI API Keys](https://platform.openai.com/account/api-keys)
    - [Google Cloud API Keys](https://cloud.google.com/text-to-speech/docs/before-you-begin)

7. Run the app

```
$ npm start
```

You should now be able to access the app at http://localhost:3000! 

## Configure
Configuring existing models can be done through the Config page of the app.
![image](https://user-images.githubusercontent.com/44745172/222992978-7c3606d8-1522-4dab-bbdb-1967914b30e4.png)

The fields of these configurations are specified in a JSON file for each model which can be found under their corresponding folder. For example: models/ChatGPT/conf.json

The fields that appear in the app can be changed by changing these conf.json files along the lines of the defined fields.

So far there are three types of fields that can be specified:
  - text
  - chekbox
  - dropdown

Whenever a new field is added, the new parameters can be used inside the exe.js file of the corresponding model where they will be contained within the parameters.configuration expression.

## Chat
A chat inferace is available in the app that allows for typing messages, or talking using the microphone.
![image](https://user-images.githubusercontent.com/44745172/222993981-c79c63a4-4ae2-4bff-bcea-cf93c16bb6b6.png)

The chat process consists of three stages:
  - Transcribe (Take speech audio and convert it to text)
  - Generate (Create a text response from the AI to the given prompt)
  - Synthsize (Create speech audio from the generated text)

Each of these stages have one or more AI models associated with them, based on their configuration.

## Adding New Models

1. Navigate to the models folder inside the project.
2. Create a copy of the Template folder and name it based on the name of the new model.
3. Edit the conf.json file inside this folder to fit the specifications of your model.
4. Edit the exe.js file to specify the operations that should be performed whenever your model is called.
