const Schedular = require('../../util/Scheduler');
const {InputProcess} = require('../../util/Process');
const { ipcRenderer } = require('electron');

document.getElementById('back-btn').addEventListener('click', () => {
    ipcRenderer.send('gotoMainWindow');
})

// Table definition
let tableData = [
    {
        processId: 'Process 1',
        arrivalTime: '0',
        burstTime: '5',
        priority: '1',
    },
    {
        processId: 'Process 2',
        arrivalTime: '1',
        burstTime: '4',
        priority: '2',
    },
    {
        processId: 'Process 3',
        arrivalTime: '1',
        burstTime: '3',
        priority: '3',
    },
];
let table = new Tabulator("#processes-table", {
    columns:[
        {title: 'Process ID', field: 'processId', resizable: false},
        {title: 'Arrival Time', field: 'arrivalTime', resizable: false},
        {title: 'Burst Time', field: 'burstTime', resizable: false},
        {title: 'Priority', field: 'priority', resizable: false},
    ],
    data: tableData,
    layout:"fitColumns",
    movableRows: true,
    height: "100%",
    rowHeight: 30,
})
// Add element to the table
const addProcessBtn = document.getElementById('add-btn');
addProcessBtn.addEventListener('click', () => {
    const processId = document.getElementById('process-id').value;
    const arrivalTime = document.getElementById('arrival-time').value;
    const burstTime = document.getElementById('burst-time').value;
    const priority = document.getElementById('priority').value;
    table.addRow({
        processId,
        arrivalTime,
        burstTime,
        priority,
    });
});


// Chart Code 
const schedular = new Schedular([
    new InputProcess(1, 0, 5, 1),
    new InputProcess(2, 1, 4, 2),
    new InputProcess(3, 1, 3, 3),
]);

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
    schedular.nonPreemptivePriority();
    startBtn.disabled = true;
    startBtn.classList.add('disabled-btn');
});

schedular.on('draw', (receivedProcess) => {
    const WIDTH_UNIT = 30;
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
