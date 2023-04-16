const { EventEmitter } = require('stream');
const { GUIProcess, TimeCalculation } = require('../util/Process');

class RoundRobin extends EventEmitter {
	#QProcesses; // running Q
	#QuantumTime; // QuantumTime to do context switching
	#ReferenceTime; // Time taken to serve all the processes
	#avgTurnAround; // Average Turn Around Time
	#avgWaitingTime; // Average Waiting Time
	#totalProcesses; // Total number of processes that will be served
	#segments; // keep track all segments that will be sent to the GUI
	#QnewProcesses;
	#ReferenceTimeSetted;
	
	constructor(inputProcesses, QuantumTime) {
		super();
		// sort by the arrival Time
		inputProcesses.sort((a, b) => a.arrivalTime - b.arrivalTime);
		this.#QnewProcesses = inputProcesses.length ? inputProcesses.slice(1) : [];
		this.#QProcesses = inputProcesses.length ? [inputProcesses[0]] : [];
		this.#QuantumTime = QuantumTime;
		this.#avgTurnAround = 0;
		this.#avgWaitingTime = 0;
		this.#totalProcesses = inputProcesses ? 1 : 0;
		this.emptyInputProcesses = inputProcesses.length ? false : true;
		this.#ReferenceTime = this.emptyInputProcesses ? 0 : this.#QProcesses[0].arrivalTime; // set the reference time with the lowest arrival Time of the processes
		this.#segments = [];
		this.#ReferenceTimeSetted = this.emptyInputProcesses ? false : true;
	}

	async #handleDrawAll(){
		// 1. sort all QnewProcesess by the arrival time
		// 2. initialize the reference time with the 1st process in the QnewProcesses
		// 3. initialize the QRunning with the proccess that have the same reference time
		// 4. serve the the first item in the QRunning
		// 5. after retrieve from the serve function chech in the QnewProcesses if there exists a process 
		// have arrival time <=Refernce time then insert in the QRunnning 
		// 6. if there exists residules in the QnewProcess and the QRunning is empty that means
		// the residules are coming processes in the future so we have to adjust the refernce time over the 1st
		// process and push again the proccess that have arrival === reference time

		let sumTurnAround = 0;
		let sumWaitingTime = 0;
		this.#QnewProcesses.sort((a,b)=>a.burstTime-b.burstTime);
		while(!this.#QnewProcesses[0].burstTime)
			this.#QnewProcesses.shift();

		this.#QnewProcesses.sort((a,b)=>a.arrivalTime-b.arrivalTime);
		this.#ReferenceTime = this.#QnewProcesses[0].arrivalTime;
		this.#totalProcesses = this.#QnewProcesses.length;
		while(this.#QnewProcesses.length && this.#QnewProcesses[0].arrivalTime ===this.#ReferenceTime)
			this.#QProcesses.push(this.#QnewProcesses[0]),this.#QnewProcesses.shift();
		
		while(this.#QProcesses.length){

			let runningProcess = this.#QProcesses[0];
			this.#QProcesses.shift();
			let segment = new GUIProcess(runningProcess.processId,
										this.#ReferenceTime,
										this.#ReferenceTime+this.#getEndTime(runningProcess));
			
			this.#serveProcessWithDrawAll(runningProcess);
			if(segment.start !== segment.end)
				this.#segments.push(segment);
			if(runningProcess.consumedTime < runningProcess.burstTime)
				this.#QProcesses.push(runningProcess);
			else{
				sumTurnAround += this.#ReferenceTime -runningProcess.arrivalTime;
				sumWaitingTime+= this.#ReferenceTime -runningProcess.arrivalTime -runningProcess.burstTime;
			}
			// check for proccess in the QnewProccess to push
			while(this.#QnewProcesses.length){
				if(this.#QnewProcesses[0].arrivalTime <= this.#ReferenceTime)
					this.#QProcesses.push(this.#QnewProcesses.shift());
				else
					break;	
			}
			// check if there exists proccess that will come in the future 
			if(!this.#QProcesses.length && this.#QnewProcesses.length){
				this.#ReferenceTime = this.#QnewProcesses[0].arrivalTime;
				while(this.#QnewProcesses.length && this.#QnewProcesses[0].arrivalTime ===this.#ReferenceTime)
					this.#QProcesses.push(this.#QnewProcesses.shift());
			}
			
		}
		this.#avgTurnAround = sumTurnAround / this.#totalProcesses;
		this.#avgWaitingTime = sumWaitingTime / this.#totalProcesses;
		let calculationObj = new TimeCalculation(this.#avgWaitingTime,this.#avgTurnAround);
		this.emit('drawAll',this.#segments);
		this.emit('done',calculationObj);
		console.log(this.#segments);
		console.log(calculationObj);


	}
	async #serveProcessWithDrawAll(process){
		for(let i = 0;i<this.#QuantumTime;i++){
			if(process.consumedTime >= process.burstTime)
				break;
			this.#ReferenceTime++;
			process.consumedTime++;
			if(process.consumedTime%this.#QuantumTime === 0)
				return;	
		}
	}
	async Run(drawAll = false) {

		if(drawAll)
			await this.#handleDrawAll();
		else
			await this.#handleDrawEveryOneSecond();	
	}
	async #handleDrawEveryOneSecond(){
		let sumTurnAround = 0;
		let sumWaitingTime = 0;
		let Live = true;
		if (this.emptyInputProcesses) {
			this.#QnewProcesses.sort((a, b) => a.arrivalTime - b.arrivalTime);
			this.#QProcesses = [this.#QnewProcesses[0]];

			if (this.#QProcesses.length) {
				this.#ReferenceTime = this.#QnewProcesses[0].arrivalTime;
				this.#ReferenceTimeSetted = true;
			}
			this.#QnewProcesses.shift();
			while(this.#QnewProcesses.length){
				if(!this.#QnewProcesses[0].burstTime){
					this.#QnewProcesses.shift();
					continue;
				}
				if(this.#QnewProcesses[0].arrivalTime === this.#ReferenceTime){
					this.#QProcesses.push(this.#QnewProcesses[0]);
					this.#QnewProcesses.shift();
					this.#totalProcesses++;
				}
				else
					break;
			}

		}

		const CheckNewComingProcesses = setInterval(() => {
			// check every one second for the new coming proccesses to push
			// them @ the correct arrival time
			// taking onto consideration the life status of the algorithm
			// and processes that can come at the same arrival time!
			if (!Live) clearInterval(CheckNewComingProcesses);
			this.#QnewProcesses.sort((a,b)=>a.arrivalTime-b.arrivalTime);
			while(this.#QnewProcesses.length) {
				if(!this.#QnewProcesses[0].burstTime){
					this.#QnewProcesses.shift();
					continue;
				}
				if (!this.#ReferenceTimeSetted) {
					this.#ReferenceTimeSetted = true;
					this.#ReferenceTime = this.#QnewProcesses[0].arrivalTime;
				}
				
				if (this.#QnewProcesses[0].arrivalTime <= this.#ReferenceTime) {
					this.#QProcesses.push(this.#QnewProcesses[0]);
					this.#QnewProcesses.shift();
					this.#totalProcesses++;

				} else break;
			}
		
		}, 1000);

		while (this.#QProcesses.length) {
			let currentRunningProcess = this.#QProcesses[0];
			this.#QProcesses.shift();

			let emittedWithTransition = new GUIProcess(currentRunningProcess.processId,
														this.#ReferenceTime,this.#ReferenceTime+1);
														
			await this.#serveProcessEveryOneSecond(currentRunningProcess, emittedWithTransition);
			

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
				this.#ReferenceTimeSetted = false;
				// wait 10 second until a new process come to the Q or terminate!
				await this.#wait(1000);
				this.#ReferenceTime++;
				counter++;
			}
		}
		Live = false;
		this.#avgTurnAround = (sumTurnAround / this.#totalProcesses).toFixed(3);
		this.#avgWaitingTime = (sumWaitingTime / this.#totalProcesses).toFixed(3);
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
	async #serveProcessEveryOneSecond(RunningProcess, emittedProcess) {
		for (let i = 0; i < this.#QuantumTime; i++) {
			if (RunningProcess.consumedTime >= RunningProcess.burstTime) {
				break;
			}
			const waitTime = 1000;
			if(emittedProcess)
				await this.#wait(waitTime);
			
			this.#ReferenceTime++;

			if (emittedProcess){ 
				this.emit('draw', emittedProcess); // notify the GUI every one second
				emittedProcess.start = emittedProcess.end;
				emittedProcess.end++;
			}
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
		// any new process will initially appended to the new Q
		this.#QnewProcesses.push(Process);
	}

	get avgTurnAround() {
		return this.#avgTurnAround;
	}
	get avgWaitingTime() {
		return this.#avgWaitingTime;
	}
	setQuantum(QuantumTime) {
		this.#QuantumTime = QuantumTime;
	}
}

module.exports = RoundRobin;
