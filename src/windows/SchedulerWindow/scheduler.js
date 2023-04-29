const NonPreemptive = require('../../../util/NonPreemptive');
const Preemptive = require('../../../util/Preemptive');
const RoundRobin = require('../../../util/RoundRobin');
const {InputProcess} = require('../../../util/Process');
const { ipcRenderer } = require('electron');


// Globals
let ALGORITHM_STARTED = false;
let PROCESS_ID = 1;
let arrivalTimeIntervalID = null;
let quantum = null;
const WIDTH_UNIT = 30;
const algorithmTitle = document.querySelector('.header h1').innerText.toLowerCase();
const addProcessForm = document.querySelector('#new-process-form');
const startBtn = document.getElementById('start-btn');
const liveInput = document.getElementById('live');
const chartContainer = document.getElementById('chart-container');
const arrivalTimeInput = document.getElementById('arrival-time');
const avgWaitingTimeElement = document.getElementById('avg-waiting-result');
const avgTurnaroundTimeElement = document.getElementById('avg-turnaround-result');
const quantumForm = document.getElementById('quantum-form');
const quantumInput = document.getElementById('quantum');
let table = null;
const scheduler = schedulerFactory(algorithmTitle);
const colors = [];
const remainingTime = [];


// Handle back button
document.getElementById('back-btn').addEventListener('click', () => {
    ipcRenderer.send('gotoMainWindow');
});
// Handle Retry button
document.getElementById('retry-btn').addEventListener('click', () => {
    window.location.reload();
});
// Handle Quantum form
if(algorithmTitle === 'round robin') {
	quantumForm.addEventListener('submit', (submitEvent) => {
		submitEvent.preventDefault();
		quantum = Number(quantumInput.value);
		scheduler.setQuantum(quantum);
		for (let child of quantumForm.children) {
			child.disabled = true;
			if (child.tagName.toLowerCase() === 'button') {
				child.classList.add('disabled-btn');
			} else if (child.tagName.toLowerCase() === 'input') {
				child.value = `Qtm = ${quantum}`;
			}
		}
	});
}


// Table configuration
function configureProcessesTable(){
    const tableColumns = [
		{ title: 'Process ID', field: 'processId', resizable: false },
		{ title: 'Arrival Time', field: 'arrivalTime', resizable: false },
		{ title: 'Burst Time', field: 'burstTime', resizable: false },
	];
	if (algorithmTitle.includes('priority')) {
		tableColumns.push({ title: 'Priority', field: 'priority', resizable: false });
	}
	table = new Tabulator('#processes-table', {
		columns: tableColumns,
		data: [],
		layout: 'fitColumns',
		movableRows: true,
		height: '100%',
		rowHeight: 30,
	});

    addProcessForm.addEventListener('submit', (submitEvent) => {
		submitEvent.preventDefault();
		addNewProcess();
        evacuateInputFields();
	});
}


// Chart configuration 
function configureChart() {
	let curProcess = null;
	let curProcessDiv = null;
	startBtn.addEventListener('click', async () => {
		liveInput.disabled = true;
		if(algorithmTitle === 'round robin'){
			if(!quantum){ // quantum time not set
				ipcRenderer.send('error', 'quantum time not set');
				return;
			}
		}
		startArrivalTimeTimer();
		ALGORITHM_STARTED = true;
		// get the data from the table then add all processes to scheduler queue
		table
			.getData()
			.map((process) =>
					new InputProcess(
						process.processId,
						process.arrivalTime,
						process.burstTime,
						process.priority
					)
			)
			.forEach((process) => {
				scheduler.appendToQueue(process);
			});
		// run the algorithm
		runSelectedScheduler(liveInput.checked);
		disableStartBtn();
	});
	scheduler.on('draw', (receivedProcess /* GUIProcess */) => {
		if (receivedProcess?.processId === curProcess?.processId) {
			if(algorithmTitle.includes('round robin') && !(liveInput.checked)){ // round robin and not live
				remainingTime[receivedProcess?.processId] -= (
					remainingTime[receivedProcess?.processId] > quantum
						? quantum
						: remainingTime[receivedProcess?.processId]
					);
				curProcessDiv.style.width = `${curProcessDiv.offsetWidth + (WIDTH_UNIT * quantum)}px`;
			} else {
				remainingTime[receivedProcess.processId]--;
				curProcessDiv.style.width = `${curProcessDiv.offsetWidth + WIDTH_UNIT}px`;
			}
			// same as the running process
			
			for (let child of curProcessDiv.children) {
				if (child.classList.contains('chart-segment-end-time')) {
					child.innerText = receivedProcess.end;
				} else if(child.classList.contains('segment-remaining-time')){
					child.innerText = `RT: ${remainingTime[receivedProcess.processId]}`;
				}
			}

		} else {
			// new process
			curProcess = receivedProcess;
			curProcessDiv = createChartSegment(curProcess);
			if (liveInput.checked) {
				curProcessDiv.classList.add('live-chart-segment');
			}
			chartContainer.appendChild(curProcessDiv);
		}
		chartScroll();
	});
	scheduler.on('drawAll', (processes) => {
		processes.forEach((process) => {
			scheduler.emit('draw', process);
		});
	});
}


// Time configuration
function configureTime() {
	scheduler.on('done', (avgTime) => {
		avgWaitingTimeElement.innerText = `${Number(avgTime.waiting).toFixed(2)}s`;
		avgTurnaroundTimeElement.innerText = `${Number(avgTime.turnaround).toFixed(2)}s`;
		terminateAlgorithm();
	});
}


// Helpers
function addNewProcess(){
    const arrivalTime = Number(document.getElementById('arrival-time')?.value);
    const burstTime = Number(document.getElementById('burst-time')?.value);
    const priority = Number(document.getElementById('priority')?.value);
    const newRow = {
        processId: PROCESS_ID,
        arrivalTime,
        burstTime,
    };
    if (algorithmTitle.includes('priority')) {
        newRow.priority = priority;
    }
    table.addRow(newRow);
    if (ALGORITHM_STARTED) {
        scheduler.appendToQueue(new InputProcess(PROCESS_ID, arrivalTime, burstTime, priority));
    }
	remainingTime[PROCESS_ID] = burstTime;
    PROCESS_ID++;
}
function evacuateInputFields(){
    if(!ALGORITHM_STARTED){
        document.getElementById('arrival-time').value = '';
    }
    document.getElementById('burst-time').value = '';
	if(algorithmTitle.includes('priority')){
		// this element does not exist except for priority algorithms
		document.getElementById('priority').value = '';
	}
}
function startArrivalTimeTimer(){
    arrivalTimeInput.disabled = true;
	let timer = 0;
	if (algorithmTitle != 'round robin') {
		timer = 1;
	}
	arrivalTimeInput.value = timer;
    arrivalTimeIntervalID = setInterval(() => {
        timer++; 
        arrivalTimeInput.value = timer;
    }, 1000);
}
function disableStartBtn(){
    startBtn.disabled = true;
    startBtn.classList.add('disabled-btn');
}
function createChartSegment(process /* GUIProcess */) {
	const processId = Number(process.processId);
	if (algorithmTitle.includes('round robin') && !liveInput.checked) {
		remainingTime[processId] -= (
			remainingTime[processId] > quantum
				? quantum
				: remainingTime[processId]
			);
	} else {
		remainingTime[processId]--;
	}
    chartDiv = document.createElement('div');
    chartDiv.classList.add('chart-segment');
	if(!colors[processId]){
		colors[processId] = generateColor();
	}
	chartDiv.style.backgroundColor = colors[processId];
    chartDiv.innerHTML = `
        <p class="chart-segment-start-time">${process.start}</p>
        <p class="chart-segment-end-time">${process.end}</p>
        <p> P${process.processId} </p>
		<p class="segment-remaining-time" title="remaining time"> RT: ${remainingTime[processId]}</p>
    `
    return chartDiv;
}
function runSelectedScheduler(live /* Boolean */){
	if(algorithmTitle.includes('priority')){
		scheduler.start( {Algorithm: 'priority', Live: live} );
	} else if(algorithmTitle.includes('sjf')){
		scheduler.start({Algorithm: 'sjf', Live: live});
	} else if(algorithmTitle === 'round robin'){
		scheduler.Run(!live);
	} else if(algorithmTitle === 'first come first serve (fcfs)'){
		scheduler.start( {Algorithm: 'fcfs', Live: live} );
	}
}
function terminateAlgorithm(){
	clearInterval(arrivalTimeIntervalID);
	for(let child of addProcessForm.children){
		child.disabled = true;
		if(child.tagName.toLowerCase() === 'input'){
			child.value = '';
		} else {
			child.classList.add('disabled-btn');
		}
	}
}
function schedulerFactory(title){
	if(title.includes('non-preemptive') || title.includes('fcfs')){
		return new NonPreemptive([]);
	} else if(title.includes('preemptive')){
		return new Preemptive([]);
	} else if(title.includes('round robin')){
		return new RoundRobin([], 1);
	}
}
function generateColor(){
    return randomColor({
		luminosity: 'dark',
		format: 'hex',
		hue: 'random'
	})
}
function chartScroll(){
	chartContainer.scrollLeft = chartContainer.scrollWidth;
}

// Main
configureProcessesTable();
configureChart();
configureTime();