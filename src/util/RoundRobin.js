const { EventEmitter } = require('stream');
const { GUIProcess, TimeCalculation } = require('./Process');

// class InputProcess {
//     constructor(processId, arrivalTime, burstTime, priority, quantum) {
//         this.processId = processId;
//         this.arrivalTime = arrivalTime;
//         this.burstTime = burstTime;
//         this.priority = priority;
//         this.quantum = quantum;
//     }
// }

// class GUIProcess {
//     constructor(processId,start, end) {
//         this.processId = processId;
//         this.start = start;
//         this.end = end;
//     }
// }

class RoundRobin extends EventEmitter {
	#QProcesses; // running Q
	#QuantumTime; // QuantumTime to do context switching
	#ReferenceTime; // Time taken to serve all the processes
	#avgTurnAround; // Average Turn Around Time
	#avgWaitingTime; // Average Waiting Time
	#totalProcesses; // Total number of processes that will be served
	#segments; // keep track all segments that will be sent to the GUI
	#QnewProcesses;

	constructor(inputProcesses, QuantumTime) {
		super();
		// sort by the arrival Time
		inputProcesses.sort((a, b) => a.arrivalTime - b.arrivalTime);

		this.#QnewProcesses = inputProcesses ? inputProcesses.slice(1) : [];
		this.#QProcesses = inputProcesses ? [inputProcesses[0]] : [];

		this.#QuantumTime = QuantumTime;

		this.#avgTurnAround = 0;
		this.#avgWaitingTime = 0;
		this.#totalProcesses = inputProcesses ? 1 : 0;

		this.#ReferenceTime = this.#QProcesses[0].arrivalTime; // set the reference time with the lowest arrival Time of the processes

		this.#segments = [];
	}

	async Run(drawAll = false) {
		let sumTurnAround = 0; // acculate the turn around time for all served processes
		let sumWaitingTime = 0; // acculate the waiting time for all served processes
		let Live = true; // check if the algorithm is already running or terminated!

		const CheckNewComingProcesses = setInterval(() => {
			// check every one second for the new coming processes to push
			// them @ the correct arrival time
			// taking onto consideration the life status of the algorithm
			// and processes that can come at the same arrival time!
			if (!Live) clearInterval(CheckNewComingProcesses);

			if (this.#QnewProcesses.length) {
				for (let i = 0; i < this.#QnewProcesses.length; i++) {
					if (this.#QnewProcesses[0].arrivalTime === this.#ReferenceTime) {
						this.#QProcesses.push(this.#QnewProcesses[0]);
						this.#QnewProcesses.shift();
						this.#totalProcesses++;
					} else break;
				}
			}
		}, 1000);

		while (this.#QProcesses.length) {
			let currentRunningProcess = this.#QProcesses[0];
			this.#QProcesses.shift();

			let emittedProcess = new GUIProcess(
				currentRunningProcess.processId,
				this.#ReferenceTime,
				this.#getEndTime(currentRunningProcess) + this.#ReferenceTime
			);
			if (!drawAll) await this.#serveProcess(currentRunningProcess, emittedProcess);
			else {
				await this.#serveProcess(currentRunningProcess, null);
				this.#segments.push(emittedProcess);
			}

			if (currentRunningProcess.consumedTime < currentRunningProcess.burstTime) {
				this.#QProcesses.push(currentRunningProcess);
			} else {
				sumTurnAround += this.#ReferenceTime - currentRunningProcess.arrivalTime;
				sumWaitingTime +=
					this.#ReferenceTime -
					currentRunningProcess.arrivalTime -
					currentRunningProcess.burstTime;
			}

			let counter = 0;
			while (!this.#QProcesses.length && counter < 10) {
				// wait 10 second until a new process come to the Q or terminate!
				await this.#wait(1000);
				this.#ReferenceTime++;
				counter++;
			}
		}
		Live = false;
		this.#avgTurnAround = (sumTurnAround / this.#totalProcesses).toFixed(3);
		this.#avgWaitingTime = (sumWaitingTime / this.#totalProcesses).toFixed(3);

		if (drawAll) this.emit('drawAll', this.#segments);

		let calculationObj = new TimeCalculation(this.#avgWaitingTime, this.#avgTurnAround);

		this.emit('done', calculationObj);
	}

	#getEndTime(process) {
		// input:   current running process
		// output:  the remaining time for the process
		let diff = process.burstTime - process.consumedTime;
		let endTime = diff < this.#QuantumTime ? diff : this.#QuantumTime;
		return endTime;
	}

	async #serveProcess(RunningProcess, emittedProcess) {
		for (let i = 0; i < this.#QuantumTime; i++) {
			if (RunningProcess.consumedTime >= RunningProcess.burstTime) {
				break;
			}

			const waitTime = 1000;
			await this.#wait(waitTime);
			this.#ReferenceTime++;

			if (emittedProcess) this.emit('draw', emittedProcess); // notify the GUI every one second

			RunningProcess.consumedTime++;
			if (RunningProcess.consumedTime % this.#QuantumTime === 0) {
				break;
			}
		}
	}

	async #wait(ms) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve();
			}, ms);
		});
	}

	#getCompletePercentage(Process) {
		if (!Process.BurstTime) return 0;
		else return parseInt(Math.floor((Process.consumedTime / Process.BurstTime) * 100));
	}

	appendToQueue(Process) {
		this.#QnewProcesses.push(Process);
		// this.#totalProceses++;
	}

	get avgTurnAround() {
		return this.#avgTurnAround;
	}

	get avgWaitingTime() {
		return this.#avgWaitingTime;
	}

    setQuantumTime(time){
        this.#QuantumTime = time;
    }
}

module.exports = RoundRobin;
