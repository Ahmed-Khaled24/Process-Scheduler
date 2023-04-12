const { EventEmitter } = require("stream");
const { GUIProcess } = require("./process");

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
        this.emit("draw", emittedProcess);
      } else {
        resultArr = [...resultArr, emittedProcess];
      }

      this.count += 1;
      if (this.inputProcesses[idx].burstTime == 0) {
        this.inputProcesses.splice(idx, 1);
      }
    }
    if (!live) {
      this.emit("drawAll", resultArr);
    }
  }
  appendToQueue(process) {
    this.inputProcesses.push(process);
  }
}

module.exports = Algorithm;
