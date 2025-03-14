const { app, BrowserWindow, ipcMain } = require('electron/main');

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

let availablePorts = []

let serial;
let serialSetup = false;
let parser;
let parserSetup = false;

async function getSerialPorts(){
  availablePorts = []
  const serialPorts = await SerialPort.list()
  serialPorts.forEach((e)=>{
      availablePorts.push(e.path)
  })
}

let mainWindow = null

function createWindow(){
    const window = new BrowserWindow({
        width: 1600,
        height: 900,
        fullscreenable: true,
        resizable: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
            allowRunningInsecureContene: true
        }
    })
    
    window.loadFile("./sonar.html")

    mainWindow = window
}

app.on("ready", ()=>{
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
})

ipcMain.handle("getPorts", async()=>{
  
  await getSerialPorts()
  return availablePorts

})

ipcMain.handle("emit", async(data)=>{

  serial.write(data)

})

ipcMain.on("setCom", async(port, baudRate)=>{

  serial = new SerialPort(port, {
     baudRate: baudRate
  })
  parser = new ReadlineParser();
  serial.pipe(parser)

  parser.on("data", (data)=>{
    mainWindow.webContents.send("dataRecieved", data)
  })

})