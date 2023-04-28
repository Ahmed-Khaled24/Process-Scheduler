 const {readFileSync, writeFileSync} = require('fs');
 const {join} = require('path');
 const {ipcRenderer} = require('electron');
 const exitBtn = document.getElementById('exit');
 const nextBtn = document.getElementById('next');
 const ejs = require('ejs');
 const algoTypes = document.querySelectorAll('input[name="main-question"]');

let appDataPath = null;
ipcRenderer.send('giveMeAppDataPath');
ipcRenderer.on('hereIsAppDataPath', (event, path) => {
    appDataPath = path;
});

 exitBtn.addEventListener('click', () => {
    ipcRenderer.send('exit');
 })

 nextBtn.addEventListener('click', () => {
    const schedulerTemplate = readFileSync(
		join(__dirname, '../SchedulerWindow/scheduler.ejs'),
		'utf-8'
	);
    let renderedTemplate = null;
    let schedulerType = null;
    for(let algoType of algoTypes) {
        if(algoType.checked) {
            schedulerType = algoType.value;
            break;
        }
    }
    switch(schedulerType) {
        case 'fcfs':{
            renderedTemplate = ejs.render(schedulerTemplate, {
                headerTitle: 'First Come First Serve (FCFS)',
                pageTitle: 'First Come First Serve (FCFS)',
                priority: false,
                roundRobin: false,
            });
            break;
        }
        case 'pre-sjf':{
            renderedTemplate = ejs.render(schedulerTemplate, {
                headerTitle: 'Preemptive Shortest Job First (SJF)',
                pageTitle: 'Preemptive Shortest Job First (SJF)',
                priority: false,
                roundRobin: false,
            });
            break;
        }
        case 'non-sjf' :{
            renderedTemplate = ejs.render(schedulerTemplate, {
                headerTitle: 'Non-Preemptive Shortest Job First (SJF)',
                pageTitle: 'Non-Preemptive Shortest Job First (SJF)',
                priority: false,
                roundRobin: false,
            });
            break;
        }
        case 'pre-priority':{
            renderedTemplate = ejs.render(schedulerTemplate, {
                headerTitle: 'Preemptive Priority',
                pageTitle: 'Preemptive Priority',
                priority: true,
                roundRobin: false,
            });
            break;
        }
        case 'non-priority':{
            renderedTemplate = ejs.render(schedulerTemplate, {
                headerTitle: 'Non-Preemptive Priority',
                pageTitle: 'Non-Preemptive Priority',
                priority: true,
                roundRobin: false,
            });
            break;
        }
        case 'round-robin':{
            renderedTemplate = ejs.render(schedulerTemplate, {
                headerTitle: 'Round Robin',
                pageTitle: 'Round Robin',
                priority: false,
                roundRobin: true,
            });
            break;
        }
    }
    writeFileSync(
		join(appDataPath, 'Process-Scheduler/src/windows/SchedulerWindow/scheduler.html'),
		renderedTemplate,
		{ encoding: 'utf-8', flag: 'w' }
	);
    ipcRenderer.send('gotoAlgorithmWindow');
});

algoTypes.forEach(type => {
    type.addEventListener('change', () => {
        nextBtn.disabled = false;
    });
})