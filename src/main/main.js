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
ipcMain.on('gotoAlgorithmWindow', (event, SchedulerType) => {
    switch(SchedulerType){
        case 'non-sjf':
            mainWindow.loadFile(join(__dirname,`../windows/algorithmWindow/SJF/SJFNonPreemptive.html`));
            break;
        case 'pre-sjf': 
            mainWindow.loadFile(join(__dirname,`../windows/algorithmWindow/SJF/SJFPreemptive.html`));
            break;
        case 'non-priority':
            mainWindow.loadFile(join(__dirname,`../windows/algorithmWindow/Priority/PriorityNonPreemptive.html`));
            break;
        case 'pre-priority': 
            mainWindow.loadFile(join(__dirname,`../windows/algorithmWindow/Priority/PriorityPreemptive.html`));
            break;
        case 'round-robin': 
            mainWindow.loadFile(join(__dirname,`../windows/algorithmWindow/RR/RR.html`));
            break;
        case 'fcfs':
            mainWindow.loadFile(join(__dirname,`../windows/algorithmWindow/FCFS/FCFS.html`));
            break;
    }
});
ipcMain.on('gotoMainWindow', (event) => {
    mainWindow.loadFile(join(__dirname,'../windows/mainWindow/mainWindow.html'));
});