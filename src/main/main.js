const {app, BrowserWindow} = require('electron');
const {join} = require('path');

let mainWindow;
app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.loadFile(join(__dirname,'../windows/mainWindow/mainWindow.html'));
})

mai