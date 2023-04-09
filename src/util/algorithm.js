const { EventEmitter } = require("stream");

// type processes = {
//     processId: number,
//     arrivalTime: number,
//     burstTime: number,
//     priority: number,
// }

async function wait(seconds) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds*1000);
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
    this.inputProcesses.forEach(async (process) => {
      let sentSegment = {
        processId: process.processId,
        duration: {
          start: this.count,
          end: this.count + process.burstTime,
        },
      };
      await wait(process.burstTime );
      this.emit('draw', sentSegment);
      this.count += process.burstTime;
    });
  }

  appendToQueue(process) {
    this.inputProcesses.push(process);
  }
}

module.exports = Algorithm;

// {
//     priorityy: 2,
//     burstTime: 3,
// }
// {
//     priorityy: 1,
//     burstTime: 2,
// }
