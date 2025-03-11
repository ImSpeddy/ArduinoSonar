const { ipcRenderer } = require('electron/main')

let direction = true

/*
    true  | clockwise
    false | counterclockwise
*/

let range = 100;

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

    const relativeDistance = distance/range

    const coords = calculateCoordinates(angle, relativeDistance)
    polygon1.push(coords)

    render()

}

const canvas = document.getElementById("sonar");

const sonarOrigin = {x: 0.5, y: 1}

function getAbsolutePosition(x, y){

    

    const vwWidth = canvas.width
    const vwHeight = canvas.height
    // TODO: Sync VW

    return {x: x*vwWidth, y: y*vwHeight}

}

function render(){
    if (!canvas) return;
    if (polygon1.length < 2) return;
    if (canvas.getContext) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.fillStyle = "rgb(0, 255, 0)"
        ctx.moveTo(canvas.width * 0.5, canvas.height)
        polygon1.forEach((e)=>{
            
            const coords = getAbsolutePosition(e.x, e.y)

            console.log(e)
            console.log(polygon1)
            ctx.lineTo(coords.x, coords.y)
            console.log(e.x)
            console.log(e.y)
            console.log(coords.x)
            console.log(coords.y)
        })
        ctx.closePath();
        ctx.fill();
    }
}

function calculateCoordinates(angle, distance){

    let radians = angle + 45 //* (Math.PI / 180);
    let x = 0.5 + distance * Math.cos(radians);
    let y = 1 + distance * Math.sin(radians);

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

            console.log(angle)

        }else if(e === 'D'){

            distance = tokenatedCmd[i+1]+tokenatedCmd[i+2]+tokenatedCmd[i+3]+tokenatedCmd[i+4]+tokenatedCmd[i+5]
            distance = parseInt(distance)
            distance = distance/100

            console.log(distance)

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

    handleCommand("G090D02500")
    handleCommand("G180D02500")
    handleCommand("G270D02500")
})