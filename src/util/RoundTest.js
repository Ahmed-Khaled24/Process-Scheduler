const RoundRobin = require('./RoundRobin.js');
const { InputProcess } = require('./Process.js');

function initializeProcesses(num_processes) {
	let processes = [];
	const startTime = Date.now();
	for (let index = 0; index < num_processes; index++) {
		const process = new InputProcess(
			index,
			Date.now() - startTime + index,
			Math.floor(Math.random() * 5 + 1),
			index
		);

		processes.push(process);
	}
	return processes;
}

function printProcessesInfo(processes) {
	for (const process of processes) {
		console.log(process.toString());
	}
}

// start Time of the algorithm
let startTime = Date.now();
let processes = initializeProcesses(4);
printProcessesInfo(processes);

let algo = new RoundRobin(processes, 3);
algo.Run(true);

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
	console.log(`New ${processNew.toString()}`);
}, 2000);
