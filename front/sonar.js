const { ipcRenderer } = require('electron/main')

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