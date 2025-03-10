const { ipcRenderer } = require('electron/main')

var currentConfig = {
    range: 0,
    start: 0,
    end: 0
}

document.addEventListener("DOMContentLoaded", ()=>{
    ipcRenderer.invoke("getPorts").then((ports)=>{
        ports.forEach(port => {
            const option = document.createElement("option")

            option.value = port
            option.innerHTML = port

            document.getElementById("serialSelect").appendChild(option)
        });
    })
})

function computeData(direction, distance){
    
}