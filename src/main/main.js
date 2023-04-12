const {app, BrowserWindow, ipcMain} = require('electron');
const {join} = require('path');

let mainWindow;
app.on('ready', () => {
    mainWindow = new BrowserWindow({
        minWidth: 800,
        minHeight: 600,
        backgroundColor: '#E4DCCF',
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    mainWindow.once('ready-to-show', () => { mainWindow.show() });
    mainWindow.loadFile(join(__dirname,'../windows/mainWindow/mainWindow.html'));
}) 

ipcMain.on('exit', (event) => {app.quit()});
ipcMain.on('gotoAlgorithmWindow', (event) => {
    mainWindow.loadFile(join(__dirname,`../windows/SchedulerWindow/scheduler.html`)); 
});
ipcMain.on('gotoMainWindow', (event) => {
    mainWindow.loadFile(join(__dirname,'../windows/mainWindow/mainWindow.html'));
});