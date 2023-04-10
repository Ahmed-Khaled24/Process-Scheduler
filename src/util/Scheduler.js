const { EventEmitter } = require("stream");
const { GUIProcess } = require("./Process");

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

class Scheduler extends EventEmitter {
  constructor(inputProcesses) {
    super();
    this.inputProcesses = inputProcesses;
    this.count = 0;
  }

  async nonPreemptivePriority() {
    let CPU = false;
    let currentProcess = null;
    let timeout = 0;
    while (true) {
      if (this.inputProcesses.length == 0) {
        timeout++;
      }
      if (timeout === 10) {
        break;
      }
      let filteredProcesses = this.inputProcesses.filter(
        (process) => process.arrivalTime <= this.count
      );
      filteredProcesses.sort((a, b) => a.priority - b.priority);

      await promiseWait(1000);

      if (filteredProcesses.length == 0) {
        continue;
      } else if (currentProcess === null) {
        currentProcess = {
          process: filteredProcesses[0],
          start: this.count,
          end: this.count + filteredProcesses[0].burstTime,
        };
        // this.emit("draw", {
        //   Pid: currentProcess.process.processId,
        //   start: currentProcess.start,
        //   end: currentProcess.end,
        // });
        this.emit("draw", new GUIProcess(currentProcess.process.processId, currentProcess.start, currentProcess.end));
        CPU = true;
      } else {
        if (this.count == currentProcess.end) {
          this.inputProcesses = this.inputProcesses.filter(
            (process) => process.processId !== currentProcess.process.processId
          );
          currentProcess = null;
          CPU = false;
          this.count--;
        } else {
          // this.emit("draw", {
          //   Pid: currentProcess.process.processId,
          //   start: currentProcess.start,
          //   end: currentProcess.end,
          // });
          this.emit("draw", new GUIProcess(currentProcess.process.processId, currentProcess.start, currentProcess.end));

        }
      }

      this.count++;
    }
  }

  appendToQueue(process) {
    this.inputProcesses.push(process);
  }
}

module.exports = Scheduler;
