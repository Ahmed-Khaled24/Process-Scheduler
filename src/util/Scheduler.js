const { EventEmitter } = require("stream");
const { GUIProcess ,TimeCalculation} = require("../util/Process");

function promiseWait(ms) {
	return new Promise((resolve) => {
	  setTimeout(() => {
		resolve();
	  }, ms);
	});
  }

class Scheduler extends EventEmitter {
	constructor(inputProcesses) {
		super();
		this.inputProcesses = inputProcesses;
		this.count = 0;
		this.totalProcesses = [...this.inputProcesses];
	}

	async PreemptiveSJF(live) {
		let resultArr = [];
		while (true) {
			let idx = 0;
			let timeout = 0;
			let emittedProcess = null;
			let flag = false;
			this.inputProcesses.sort((a, b) => {
				if (a.burstTime != b.burstTime) return a.burstTime - b.burstTime;
				else return a.arrivalTime - b.arrivalTime;
			});

			while (this.inputProcesses.length == 0) {
				if (live) await promiseWait(1000);
				this.count++;
				timeout++;
				if (timeout == 10) {
					flag = true;
					break;
				}
			}

			while (
				this.inputProcesses.length != 0 &&
				this.inputProcesses[idx].arrivalTime > this.count
			) {
				idx++;
				if (idx == this.inputProcesses.length) {
					if (live) await promiseWait(1000);
					this.count++;
					timeout++;
					if (timeout == 10) {
						flag = true;
						break;
					}
					idx = 0;
				}
			}
			if (flag) {
				break;
			}

			this.inputProcesses[idx].burstTime -= 1;

			let currentProcess = {
				processId: this.inputProcesses[idx].processId,
				duration: {
					start: this.count,
					end: this.count + 1,
				},
			};

			emittedProcess = new GUIProcess(
				currentProcess.processId,
				currentProcess.duration.start,
				currentProcess.duration.end
			);
			if (live) {
				await promiseWait(1000);
				this.emit('draw', emittedProcess);
			} else {
				resultArr = [...resultArr, emittedProcess];
			}

			this.count += 1;
			if (this.inputProcesses[idx].burstTime == 0) {
				this.inputProcesses.splice(idx, 1);
			}
		}
		if (!live) this.emit('drawAll', resultArr);
	}

	async PreemptivePriority(live) {
        // Helper flags
        let CPU = false;
        let currentProcess = null;
        let timeout = 0;
        let emittedProcess = null;
        let resultArr = [];

        // Main Loop
        while (true) {
            // Check if all processes are done
            if (this.inputProcesses.length == 0) {
                timeout++;
            } else {
                timeout = 0;
            }
            // Break if timeout is reached
            if (timeout === 10) {
                this.emit("done", new TimeCalculation(this.calcWaitingTime(), this.calcTurnAroundTime()));
                break;
            }
            // Filter processes that have arrived
            let filteredProcesses = this.inputProcesses.filter(
                (process) => process.arrivalTime <= this.count
            );
            // Sort processes by priority
            filteredProcesses.sort((a, b) => a.priority - b.priority);

            // Check if there are any processes that have arrived
            if (filteredProcesses.length == 0) {
                // cpu here will be free
            } else if (currentProcess === null) {
                currentProcess = {
                    process: filteredProcesses[0],
                    start: this.count,
                    end: this.count + filteredProcesses[0].burstTime,
                };
                emittedProcess = new GUIProcess(currentProcess.process.processId, this.count, this.count + 1);
                CPU = true;

            } else {
                // Check if current process is done
                if (this.count == currentProcess.end) {
                    process = this.totalProcesses.filter((process) => process.processId == currentProcess.process.processId);
                    process[0].endTime = currentProcess.end;
                    this.inputProcesses = this.inputProcesses.filter(
                        (process) => process.processId !== currentProcess.process.processId
                    );
                    currentProcess = null;
                    CPU = false;
                    continue;
                } else {
                    filteredProcesses = this.inputProcesses.filter(
                        (process) => process.arrivalTime <= this.count
                    );
                    // Sort processes by priority
                    filteredProcesses.sort((a, b) => a.priority - b.priority);
                    if (filteredProcesses[0].processId !== currentProcess.process.processId) {
                        currentProcess = {
                            process: filteredProcesses[0],
                            start: this.count,
                            end: this.count + filteredProcesses[0].burstTime,
                        };
                    }
                    emittedProcess = new GUIProcess(currentProcess.process.processId, this.count, this.count + 1);
                }
            }
            // Emit event
            if (emittedProcess) {
                if (live) this.emit("draw", emittedProcess);
                resultArr = [...resultArr, emittedProcess];
                emittedProcess = null;
            }

            // Wait for 1 second if live option selected
            if (live) {
                await promiseWait(1000);
                if (currentProcess !== null && currentProcess.process !== null)
                    currentProcess.process.burstTime--;
            }
            // Increment time
            this.count++;
        }

        if (!live) {
            this.emit("drawAll", resultArr);
        }
    }

    appendToQueue(process) {
        this.inputProcesses.push(process);
		this.totalProcesses.push(process);
    }
    calcTurnAroundTime() {
        let sum = 0;
        for (let i = 0; i < this.totalProcesses.length; i++) {
            sum += (this.totalProcesses[i].endTime - this.totalProcesses[i].arrivalTime)
        }
        return sum / this.totalProcesses.length;
    }
    calcWaitingTime() {
        let sum = 0;
        for (let i = 0; i < this.totalProcesses.length; i++) {
			sum += (this.totalProcesses[i].endTime - this.totalProcesses[i].arrivalTime - this.totalProcesses[i].burstTimeObsolete);
        }
        return sum / this.totalProcesses.length;
    }

	formatCalculation(processes /* GUIProcess Array */) {
		let formattedArr = {};
		// filter duplicates in the processes
		for (let i = processes.length - 1; i >= 0; i--) {
			if (!formattedArr[processes[i].processId]) {
				formattedArr[processes[i].processId] = processes[i];
			} else {
				formattedArr[processes[i].processId].start = processes[i].start;
			}
		}
		return formattedArr;
	}
	calculateAvgWaitingTime(processes /* Formatted Array */) {
		let totalWaitingTime = 0;
		for (const processId in processes) {
			totalWaitingTime +=
				processes[processId].end -
				processes[processId].arrivalTime -
				(processes[processId].end - processes[processId].start);
		}
		let avgWaitingTime = totalWaitingTime / Object.keys(processes).length;

		return avgWaitingTime;
	}
	calcAvgTurnAroundTime(processes /* Formatted Array */) {
		let totalTurnAroundTime = 0;
		for (const processId in processes) {
			totalTurnAroundTime += processes[processId].end - processes[processId].arrivalTime;
		}
		let avgTurnAroundTime = totalTurnAroundTime / Object.keys(processes).length;
		return avgTurnAroundTime;
	}
}

module.exports = Scheduler;
