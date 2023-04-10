const { EventEmitter } = require("stream");

// type processes = {
//     processId: number,
//     arrivalTime: number,
//     burstTime: number,
//     priority: number,
// }

  function promiseWait(ms) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve();
			}, ms);
		});
  }

class Algorithm extends EventEmitter {
  constructor(inputProcesses) {
    super(); 
    this.inputProcesses = inputProcesses;
    this.count = 0;
  }

  async nonPreemptivePriority() {
    this.inputProcesses.sort((a, b) => a.priorityy - b.priorityy);
    for (const process of this.inputProcesses) {
      let sentSegment = {
        processId: process.processId,
        duration: {
          start: this.count,
          end: this.count + process.burstTime,
        },
      };
      await promiseWait(process.burstTime * 1000);
      this.emit('draw', sentSegment);
      this.count += process.burstTime;
    }
  }

  appendToQueue(process) {
    this.inputProcesses.push(process);
  }
}

module.exports = Algorithm;
