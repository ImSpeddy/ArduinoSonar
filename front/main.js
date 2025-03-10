const { app, BrowserWindow, ipcMain } = require('electron/main');

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

let availablePorts = []

async function getSerialPorts(){
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