let taskAddButton = document.getElementById("task-add-button");
let tasksList = document.getElementById("tasks-list");
let taskContent = document.getElementById("task-content");
let categorySelect = document.getElementById("categories-list");
const HTTP_STATUS_SUCCESS = 200;

// aggiungere span con il nome della categoria (oppure il colore)

const REST_API_ENDPOINT = 'http://localhost:8080';

/**
 * questa funzione aggiorna la select delle categorie interrogando il server attraverso ajax
 * verrà invocata subito dopo il completo caricamento della pagina
 */
function updateCategoriesList() {
    //creo un oggetto di tipo xmlhttprequest per gestire la chiamata ajax al server
    let ajaxRequest = new XMLHttpRequest();

    //gestisco l evento onload : ovvero quello che succede dopo che il server mi risponde 
    ajaxRequest.onload = function () {
        // mi salvo tutte le categorie ritornate dal server in una variabile chiamata categories parsando il contenuto della response
        //attraverso l utility JSON.parse()
        let categories = JSON.parse(ajaxRequest.response);
        console.log(categories);

        //cicliamo ogni categoria all interno dell array categories
        for (let category of categories) {
            console.log(category);
            //creiamo un elemento di tipo option 
            let newOption = document.createElement("option");

            //settiamo alla option il valore e il testo prendendolo dal nome della categoria
            newOption.value = category.id;
            newOption.innerText = category.name;

            // appendiamo la option alla select 
            categorySelect.appendChild(newOption);
        }
    }

    //imposto metodo e l'url a cui fare la richiesta di tipo get al server 
    ajaxRequest.open("GET", REST_API_ENDPOINT + "/categories/");

    // invio la richiesta al server 
    ajaxRequest.send();

}

updateCategoriesList();

function createTask(task) {
    let newTaskLine = document.createElement("div");
    if (task.category) {
        newTaskLine.classList.add(task.category.color);
    }
    newTaskLine.setAttribute("data-id", task.id);
    let doneCheck = document.createElement("input");
    doneCheck.setAttribute("type", "checkbox");
    doneCheck.classList.add("checkbox");
    if (task.done) {
        newTaskLine.classList.add("done");
        doneCheck.checked = true;
    }


    let edit = document.createElement("button");
    edit.style.visibility = task.done ? "hidden" : "visible";
    edit.setAttribute("class", "edit");
    edit.innerHTML = '<i class ="fas fa-edit"></i>';

    newTaskLine.appendChild(edit);

    edit.addEventListener("click", function () {
        let input = document.createElement("input");
        input.setAttribute("type", "text");
        input.setAttribute("id", "input-edit-" + task.id);
        if (newTaskLine.classList.contains("editing")) {
            let inputEdit = document.getElementById("input-edit-" + task.id);
            let taskContent = {
                name: inputEdit.value
            };
            updateTask(task.id, taskContent, () => {
                //aggiorno l attributo name del task corrente 
                task.name = inputEdit.value;

                //sostituisco l input con lo span del nome aggiornato
                nameSpan.innerText = task.name;
                inputEdit.replaceWith(nameSpan);

                //sostituisco il dischetto con la pennetta 
                edit.innerHTML = '<i class ="fas fa-edit"></i>';

                //rimuovo la classe editing 
                newTaskLine.classList.remove("editing");
            });
        } else {
            //aggiungo una classe editing 
            newTaskLine.classList.add("editing");
            //sostuisco lo span con l'input
            input.value = nameSpan.textContent;
            nameSpan.replaceWith(input);
            //sostituisco la pennetta col dischetto
            edit.innerHTML = '<i class ="fas fa-save"></i>';
        }
    });

    doneCheck.addEventListener("click", function () {
        task.done = !task.done;
        let taskContent = {
            done: task.done
        };
        setDone(task.id, taskContent, () => {
            newTaskLine.classList.toggle("done");
            edit.style.visibility = task.done ? "hidden" : "visible";
        });
    });

    newTaskLine.appendChild(doneCheck);
    let nameSpan = document.createElement("span");
    nameSpan.innerText = task.name;
    newTaskLine.appendChild(nameSpan);
    let dateSpan = document.createElement("span");
    let date = new Date(task.created);
    dateSpan.innerText = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    newTaskLine.appendChild(dateSpan);
    let trashSpan = document.createElement("span");
    trashSpan.innerText = "canc";
    trashSpan.addEventListener("click", function () {
        deleteTask(task.id, newTaskLine);
    });
    newTaskLine.appendChild(trashSpan);
    tasksList.appendChild(newTaskLine);
}

function updateTasksList() {
    //recupero i dati dal server
    tasksList.innerHTML = "";
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = function () {
        let tasks = JSON.parse(ajaxRequest.response);
        for (let task of tasks) {
            createTask(task);
        }
    }
    ajaxRequest.open("GET", REST_API_ENDPOINT + "/tasks/");
    ajaxRequest.send();
}

updateTasksList(); //invoca la funzione

function saveTask(taskToSave) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        let savedTask = JSON.parse(ajaxRequest.response);
        createTask(savedTask);
    }
    ajaxRequest.open("POST", REST_API_ENDPOINT + "/tasks/add");
    // // dal momento che il server è di di tipo REST-full utilizza il tipo JSON per scambiare informazioni con il front end
    // pertanto il server SPRING si aspetterà dei dati in formato JSON e NON considererà richieste in cui il formato
    // non è specificato nella Header della richiesta stessa

    ajaxRequest.setRequestHeader("content-type", "application/json");
    let body = {
        name: taskToSave.name,
        category: taskToSave.category,
        created: new Date()
    };
    ajaxRequest.send(JSON.stringify(body));

}

function updateTask(taskId, taskContent, successfullCallback) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        if (ajaxRequest.status == HTTP_STATUS_SUCCESS) {
            successfullCallback();
        }

    }
    ajaxRequest.open("PUT", REST_API_ENDPOINT + "/tasks/" + taskId);
    ajaxRequest.setRequestHeader("content-type", "application/json");
    ajaxRequest.send(JSON.stringify(taskContent));
}

function setDone(taskId, taskContent, successfullCallback) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        if (ajaxRequest.status == HTTP_STATUS_SUCCESS) {
            successfullCallback();
        }

    }
    ajaxRequest.open("PUT", REST_API_ENDPOINT + "/tasks/" + taskId + "/set-done");
    ajaxRequest.setRequestHeader("content-type", "application/json");
    ajaxRequest.send(JSON.stringify(taskContent));
}

function deleteTask(taskId, taskHtmlElement) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        if (ajaxRequest.response == "ok") {
            taskHtmlElement.remove();
        }
    }
    ajaxRequest.open("DELETE", REST_API_ENDPOINT + "/tasks/" + taskId);
    //ajaxRequest.setRequestHeader("content-type", "application/json");
    //let body = {
    //  name: taskContentValue
    //};
    ajaxRequest.send();

}

taskAddButton.addEventListener("click", function () {

    let taskContentValue = taskContent.value;
    if (taskContentValue == "") {
        alert("Please write something to add!")
        return;
    }
    saveTask(taskContentValue);
});

function sendTaskToServer(taskContentValue, taskHtmlElement) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        let jsonResponse = JSON.parse(ajaxRequest.response);
        console.log(jsonResponse);
        console.log(taskHtmlElement);

        taskHtmlElement.classList.remove("unconfirmed");

        if (jsonResponse.result != "ok") {
            taskHtmlElement.classList.add("error");
        }

    }
    ajaxRequest.open("POST", "https://webhook.site/5a2a64cd-7808-4356-a491-6d1ea72c7346");

    let body = {
        text: taskContentValue
    };
    ajaxRequest.send(JSON.stringify(body));
}