# voi-to-voi
Small Framework for linking different AI models to create a Voice-To-Voice interface.
![image](https://user-images.githubusercontent.com/44745172/222991112-f3c6df88-1d6d-4cb7-a22b-5274fa5ebc89.png)

The app uses NodeJS for the backen, Express for the API and Bootstrap for the frontend.
By default the app is configure to use the Whisper model from OpenAI from Speech-to-Text, ChatGPT model also from OpenAI to generate a response, and Google Cloud for the Text-To-Speech.
To run the app with these models, you'll have to provide your own API keys. Instructions on how to aquire them can be found below.
Besides these, adding and configuring new models can be quickly done through the defined steps.
