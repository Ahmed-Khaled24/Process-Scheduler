// import { RoundRobin } from "./RoundRobin";
const  RoundRobin  = require('./RoundRobin.js');
const { InputProcess } = require('../util/Process.js');

function initializeProcesses(num_processes) {
	let processes = [];
	const startTime = Date.now();
	for (let index = 0; index < num_processes; index++) {
		const proceses = new InputProcess(
			index,
			Date.now() - startTime ,
			Math.floor(Math.random() * 5 + 1),
			index
		);

		processes.push(proceses);
	}
	return processes;
}
function printProcessesInfo(processes) {
	for (const process of processes) {
		// console.log(process.toString());
	}
}

// start Time of the algorithm
let startTime = Date.now();
let proceses = initializeProcesses(4);

let tempP = [new InputProcess(1,0,3,0,0),new InputProcess(2,0,5,0,0),new InputProcess(3,0,7,0,0)];
let testProcesses = [new InputProcess(1,0,3,0)];
printProcessesInfo(proceses);

let algo = new RoundRobin([], 2);
tempP.forEach((process) => {
	algo.appendToQueue(process);
});
algo.Run(false);

let tester = [];
algo.on('draw', (segment) => {
	tester.push(segment);
	console.log(segment);
});

algo.on('append', (process) => {
	algo.appendToQueue(process);
});

algo.on('drawAll', (arr) => {
	console.log(arr);
});

algo.on('done', (Time) => {
	console.log(Time);
});

setTimeout(() => {
	let processNew = new InputProcess(4, 10, 5, 0, 0);
	algo.appendToQueue(processNew);
}, 5000);
// setInterval(()=>{

// })
