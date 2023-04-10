const { EventEmitter } = require("stream");

// type processes = {
//     processId: number,
//     arrivalTime: number,
//     burstTime: number,
//     priority: number,
// }

function wait(ms) {
    var start = new Date().getTime();
    var end = start;
    while (end < start + ms) {
      end = new Date().getTime();
    }
  }

class Algorithm extends EventEmitter {
  constructor(inputProcesses) {
    super(); 
    this.inputProcesses = inputProcesses;
    this.count = 0;
  }

  async nonPreemptivePriority() {
    this.inputProcesses.sort((a, b) => a.priorityy - b.priorityy);
    this.inputProcesses.forEach((process) => {
      let sentSegment = {
        processId: process.processId,
        duration: {
          start: this.count,
          end: this.count + process.burstTime,
        },
      };
      wait(process.burstTime * 1000 );
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
