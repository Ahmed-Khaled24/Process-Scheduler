const {app, BrowserWindow, ipcMain, dialog, Menu} = require('electron');
const {join} = require('path');

let mainWindow;
app.on('ready', () => {
    mainWindow = new BrowserWindow({
        minWidth: 900,
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
ipcMain.on('gotoAlgorithmWindow', (event, schedulerType) => {
	let schedulerFile = null;
	switch(schedulerType) {
		case 'fcfs':
			schedulerFile = 'FCFS';
			break;
		case 'non-sjf':
			schedulerFile = 'SJF';
			break;
		case 'pre-sjf':
			schedulerFile = 'preemptiveSJF';
			break;
		case 'non-priority':
			schedulerFile = 'priority';
			break;
		case 'pre-priority':
			schedulerFile = 'preemptivePriority';
			break;
		case 'round-robin':
			schedulerFile = 'RR';
			break;
	}
    mainWindow.loadFile(join(__dirname,`../windows/SchedulerWindow/schedulers-html/${schedulerFile}.html`)); 
});
ipcMain.on('gotoMainWindow', (event) => {
    mainWindow.loadFile(join(__dirname,'../windows/mainWindow/mainWindow.html'));
});
ipcMain.on('error', (event, error) => {
    dialog.showErrorBox('Error', error);
})

Menu.setApplicationMenu(null);
