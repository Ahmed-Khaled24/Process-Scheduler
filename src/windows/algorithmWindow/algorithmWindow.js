const Algorithm = require('../')

// Table definition
let tableData = [
    {
        'Process Name': 'Process 1',
        'Arrival Time': '0',
        'Burst Time': '3',
        'Priority': '1',
    },
    {
        'Process Name': 'Process 2',
        'Arrival Time': '0',
        'Burst Time': '3',
        'Priority': '1',
    },
    {
        'Process Name': 'Process 3',
        'Arrival Time': '0',
        'Burst Time': '3',
        'Priority': '1',
    },
    {
        'Process Name': 'Process 4',
        'Arrival Time': '0',
        'Burst Time': '3',
        'Priority': '1',
    }
];
let table = new Tabulator("#processes-table", {
    columns:[

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
    const processName = document.getElementById('process-name').value;
    const arrivalTime = document.getElementById('arrival-time').value;
    const burstTime = document.getElementById('burst-time').value;
    const priority = document.getElementById('priority').value;
    table.addRow({
        'Process Name': processName,
        'Arrival Time': arrivalTime,
        'Burst Time': burstTime,
        'Priority': priority,
    });
});


// Chart Code 
const colors = ['#002B5B', '#EA5455'];
const curColor = colors[0];
function toggleColor(){
    curColor === colors[0] ? curColor = colors[1] : curColor = colors[0];
}

let curProcess = null;
let charContainer = document.getElementById('chart-container');

