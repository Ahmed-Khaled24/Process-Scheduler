const {app, BrowserWindow, ipcMain} = require('electron');
const {join} = require('path');

let mainWindow;
app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    mainWindow.loadFile(join(__dirname,'../windows/mainWindow/mainWindow.html'));
}) 

ipcMain.on('exit', (event) => {app.quit()});
ipcMain.on('gotoAlgorithmWindow', (event, algoType) => {
    mainWindow.loadFile(join(__dirname,`../windows/algorithmWindow/algorithmWindow.html`));
});
ipcMain.on('gotoMainWindow', (event) => {
    mainWindow.loadFile(join(__dirname,'../windows/mainWindow/mainWindow.html'));
});