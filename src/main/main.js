const {app, BrowserWindow, ipcMain, dialog, Menu} = require('electron');
const {join} = require('path');
const {cp} = require('fs/promises');


let mainWindow;
app.on('ready', async () => {
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
    try {
		await cp(
			join(__dirname, '../../src'),
			join(app.getPath('appData'), 'Process-Scheduler/src'),
			{ recursive: true, force: false, errorOnExist: true }
		);
		await cp(
			join(__dirname, '../../assets'),
			join(app.getPath('appData'), 'Process-Scheduler/assets'),
			{ recursive: true, force: false, errorOnExist: true }
		);
		await cp(
			join(__dirname, '../../lib'),
			join(app.getPath('appData'), 'Process-Scheduler/lib'),
			{ recursive: true, force: false, errorOnExist: true }
		);
        console.log('Copied successfully');
	} catch (error) {
		// FILES ALREADY COPIED
	}
    mainWindow.once('ready-to-show', () => { mainWindow.show() });
    mainWindow.loadFile(join(__dirname,'../windows/mainWindow/mainWindow.html'));
}) 

ipcMain.on('exit', (event) => {app.quit()});
ipcMain.on('gotoAlgorithmWindow', (event) => {
    mainWindow.loadFile(join(app.getPath('appData'),'Process-Scheduler/src/windows/SchedulerWindow/scheduler.html')); 
});
ipcMain.on('gotoMainWindow', (event) => {
    mainWindow.loadFile(join(__dirname,'../windows/mainWindow/mainWindow.html'));
});
ipcMain.on('error', (event, error) => {
    dialog.showErrorBox('Error', error);
})
ipcMain.on('giveMeAppDataPath', (event) => {
    event.sender.send('hereIsAppDataPath', app.getPath('appData'))
});

Menu.setApplicationMenu(null);