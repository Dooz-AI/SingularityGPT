
function getModels(){
    const xhr = new XMLHttpRequest();
    const url = "/api/models";
    xhr.open("GET", url);
    xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
        models = JSON.parse(xhr.responseText);

        configurableModelsHTML = ""
        for (let i = 0; i < models.length; i++) {
            const modelName = models[i];
            configurableModelsHTML += `<option>${modelName}</option>`

            if (Cookies.get(`configuration ${modelName}`) == undefined) {
                setDefaultConfiguration(modelName);
            }

        }
        document.getElementById("configurableModels").innerHTML=configurableModelsHTML

        console.log("Models: " + models);
        getConfiguration(models[0]);
    }
    };
    xhr.send();
}
getModels();

function setDefaultConfiguration(modelName){
    const xhr = new XMLHttpRequest();
    const url = "/api/conf?models="+modelName;
    xhr.open("GET", url);
    xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
        const modelConfiguration = JSON.parse(xhr.responseText);
        console.log("Setting Default configuration for " + modelName)
        //console.log(modelConfiguration[0].configuration)
        configBody = {};
        for (let i = 0; i < modelConfiguration[0].configuration.length; i++) {
            
            configField = modelConfiguration[0].configuration[i]
            if(configField.default !== "undefined"){
                configBody[configField.id] = configField.default
            }else{
                configBody[configField.id] = "null"
            }

        }
        
        Cookies.set(`configuration ${modelName}`, JSON.stringify(configBody));

    }
    };
    xhr.send();
}

function getConfiguration(model){
    const xhr = new XMLHttpRequest();
    const url = "/api/conf?models="+model;
    xhr.open("GET", url);
    xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
        const modelConfiguration = JSON.parse(xhr.responseText);

        document.getElementById("structureContainer").innerHTML = ""
        //console.log("Model Configuration: " + JSON.stringify(modelConfiguration[0].configuration));
        displayConfiguration(modelConfiguration[0]);

    }
    };
    xhr.send();
}

function displayConfiguration(modelConfiguration){

    //check if user has previous configurations
    if (Cookies.get(`configuration ${modelConfiguration.modelName}`) !== undefined) {
        userConfiguration = JSON.parse(Cookies.get(`configuration ${modelConfiguration.modelName}`))
    }else{
        userConfiguration = false
    }

    configurationForm =`<form onsubmit='configure(event, this,"${modelConfiguration.modelName}")'>`
    for (let i = 0; i < modelConfiguration.configuration.length; i++) {

        configurationField = modelConfiguration.configuration[i];

        configurationFieldHTML = `<div class="form-group">`
        configurationFieldHTML += `<label ${configurationField.id}>${configurationField.name}</label>`

        if(configurationField.type == "text"){
            textFieldValue = ""
            if(userConfiguration !== false && userConfiguration[configurationField.id] != null){
                textFieldValue = userConfiguration[configurationField.id]
            }else if(configurationField.default !== "undefined"){
                textFieldValue = configurationField.default
            }

            configurationFieldHTML +=`<input type="text" class="form-control mb-3 configurationField" id="${configurationField.id}" value="${textFieldValue}">`
        }else if(configurationField.type == "checkbox"){

            checkboxChecked = ""
            if(userConfiguration !== false){
                if(userConfiguration[configurationField.id] == true){
                    checkboxChecked = "Checked"
                }
            }else{
                if(configurationField.default == true){
                    checkboxChecked = "Checked"
                }
            }
            configurationFieldHTML = `<div class="form-check mb-3">`
            configurationFieldHTML += `<input class="form-check-input configurationField" type="checkbox" value="" id="${configurationField.id}" ${checkboxChecked}>`
            configurationFieldHTML += `<label class="form-check-label" for="${configurationField.id}">${configurationField.name}</label>`
            
        }else if(configurationField.type == "dropdown"){
            configurationFieldHTML +=`<select class="form-control mb-3 configurationField" id="${configurationField.id}">`
            for (let j = 0; j < configurationField.values.length; j++) { 
                dropdownValue = configurationField.values[j];
                if(userConfiguration !== false && userConfiguration[configurationField.id] == dropdownValue){
                    configurationFieldHTML += `<option selected>${dropdownValue}</option>`
                }else{
                    configurationFieldHTML += `<option>${dropdownValue}</option>`
                }
            }
            configurationFieldHTML +=`</select>`
        }
        configurationFieldHTML += `</div>`
        configurationForm += configurationFieldHTML
    }
    configurationForm += '<button type="submit" class="btn btn-primary">Save Configuration</button>'
    configurationForm += "</form>"

    configurationStructureCard = `
    <div class="col-md-12 mb-3">
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">${modelConfiguration.modelName}</h5>
                ${configurationForm}
            </div>
        </div>
    </div>`

    document.getElementById("structureContainer").innerHTML += configurationStructureCard

}

function configure(event, configForm, modelName){
    event.preventDefault(); 
    
    try{
        configBody = {};
        configFields = configForm.getElementsByClassName("configurationField");
        for (let i = 0; i < configFields.length; i++) {
            const configField = configFields[i];
            if(configField.type != "submit"){
                if(configField.type == "checkbox"){
                    configBody[configField.id] = configField.checked
                }else{
                    configBody[configField.id] = configField.value
                }
            }
        }

        Cookies.set(`configuration ${modelName}`, JSON.stringify(configBody));
        const toast = document.querySelector('.toast');
        const toastheader = toast.querySelector('.toast-header').querySelector("strong");
        const toastBody = toast.querySelector('.toast-body');
        toastheader.innerHTML = "Configuration Saved!"
        toastBody.innerHTML = `This configuration for the ${modelName} model has been saved to your cookies.`;
    }catch (e){
        const toast = document.querySelector('.toast');
        const toastheader = toast.querySelector('.toast-header').querySelector("strong");
        const toastBody = toast.querySelector('.toast-body');
        toastheader.innerHTML = "Configuration Failed!"
        toastBody.innerHTML = `This configuration for the ${modelName} model could not be saved to your cookies.<br>${e}`;
    }

    $('.toast').toast('show');
}