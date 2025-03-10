const { ipcRenderer } = require('electron/main')

let direction = true

/*
    true  | clockwise
    false | counterclockwise
*/

let range = 0;

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

// TODO: RENDER DATA

// TODO: HANDLE CONFIGURATION.

// TODO: HANDLE RELATIVE POSITIONS

// TODO: SETUP DEBUGS

let polygon1 = []

function recievedPositionData(angle, distance){

    const coords = calculateCoordinates(angle, distance)
    polygon1.push(coords)

}

function getAbsolutePosition(x, y){
    const vwWidth = 1600
    const vwHeight = 900
    // TODO: Sync VW

    return {x: x/vwWidth, y: y/vwHeight}

}

function render(){
    const canvas = document.getElementById("canvas");
    if (canvas.getContext) {
        const ctx = canvas.getContext("2d");
  
        ctx.beginPath();
        ctx.moveTo(800, 900)
        polygon1.forEach((e)=>{
            ctx.lineTo(e.x, e.y)
        })
        ctx.fill();
    }
}

function calculateCoordinates(angle, distance){

    let x;
    let y;

    return {x: x, y: y}

}

function reachedLimit(){
    switch (direction) {
        case true:
            direction = false
            break;
        case false:
            direction = true
            break;
        default:
            break;
    }
}

function handleCommand(command){
    /* 
    
        Command | Name                   | Syntax | Argument Info
        G       | Angle                  | GXXX   | XXX: uint8_t, Trailing 0's (must use three spaces)
        D       | Distance               | DXXXXX | XXXXX: float (positive), first XXX are integers (must use three spaces), the last two XXX are decimals (must use two spaces)
        L       | Limit                  | L      | none

    */
    console.log(command)

    const tokenatedCmd = command.split('')

    let angle = null;
    let distance = null;

    tokenatedCmd.forEach((e, i)=>{
        if(e === 'G'){
            
            angle = tokenatedCmd[i+1]+tokenatedCmd[i+2]+tokenatedCmd[i+3]
            angle = parseInt(angle)

        }else if(e === 'D'){

            distance = tokenatedCmd[i+1]+tokenatedCmd[i+2]+tokenatedCmd[i+3]+tokenatedCmd[i+4]+tokenatedCmd[i+5]
            distance = parseInt(distance)
            distance = distance/100

        }else if(e === 'L'){
            reachedLimit()
        }
    })

    if(distance !== null && angle !== null){
        recievedPositionData(angle, distance)
    }

}

document.getElementById("dbg_emit").addEventListener('click', ()=>{
    commandLine = document.getElementById("dbg_command")

    handleCommand(commandLine.value)
    commandLine.value = "";
})