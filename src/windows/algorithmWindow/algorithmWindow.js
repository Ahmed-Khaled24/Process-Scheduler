const Schedular = require('../../util/Scheduler');
const {InputProcess} = require('../../util/Process');
const { ipcRenderer } = require('electron');

let ALGORITHM_STARTED = false;
const WIDTH_UNIT = 30;

document.getElementById('back-btn').addEventListener('click', () => {
    ipcRenderer.send('gotoMainWindow');
})

// Table definition
let table = new Tabulator("#processes-table", {
    columns:[
        {title: 'Process ID', field: 'processId', resizable: false},
        {title: 'Arrival Time', field: 'arrivalTime', resizable: false},
        {title: 'Burst Time', field: 'burstTime', resizable: false},
        {title: 'Priority', field: 'priority', resizable: false},
    ],
    data: [],
    layout:"fitColumns",
    movableRows: true,
    height: "100%",
    rowHeight: 30,
})
// Add element to the table
const addProcessBtn = document.getElementById('add-btn');
addProcessBtn.addEventListener('click', () => {
    const processId = Number(document.getElementById('process-id').value);
    const arrivalTime = Number(document.getElementById('arrival-time').value);
    const burstTime = Number(document.getElementById('burst-time').value);
    const priority = Number(document.getElementById('priority').value);
    table.addRow({ // make sure the data is numbers and not strings so that the calculations are correct
        processId,
        arrivalTime,
        burstTime,
        priority,
    });
    if(ALGORITHM_STARTED){
        schedular.appendToQueue(new InputProcess(processId, arrivalTime, burstTime, priority));
    }
});


// Chart Code 
const schedular = new Schedular([])
const colors = ['#002B5B', '#EA5455'];
let curColor = colors[0];
function toggleColor(){
    curColor === colors[0] ? curColor = colors[1] : curColor = colors[0];
}

let curProcess = null;
let curProcessDiv = null;
let charContainer = document.getElementById('chart-container');
const startBtn = document.getElementById('start-btn');
startBtn.addEventListener('click', () => { 
    ALGORITHM_STARTED = true;
    // get the data from the table
    let processes = table.getData().map((process) => new InputProcess(
            process.processId,
            process.arrivalTime,
            process.burstTime,
            process.priority
		)
	);
    // send the data to the algorithm
    processes.forEach(process => {
        schedular.appendToQueue(process);
    });	
    // run the algorithm
    schedular.nonPreemptivePriority(true);
    startBtn.disabled = true;
    startBtn.classList.add('disabled-btn');
});

schedular.on('draw', (receivedProcess) => {
    console.log(`Drawing process ${receivedProcess}`);
    if(receivedProcess?.processId === curProcess?.processId){ // Same as the running process
        curProcessDiv.style.width = `${curProcessDiv.offsetWidth + WIDTH_UNIT}px`;
    } else { // New process
        curProcess = receivedProcess;
        curProcessDiv = document.createElement('div');
        curProcessDiv.classList.add('chart-segment');
        curProcessDiv.style.backgroundColor = curColor;
        toggleColor();
        curProcessDiv.innerHTML = `
            <p class="chart-segment-start-time">${receivedProcess.start}</p>
            <p class="chart-segment-end-time">${receivedProcess.end}</p>
            P${receivedProcess.processId}
        `
        charContainer.appendChild(curProcessDiv);
    }
});
