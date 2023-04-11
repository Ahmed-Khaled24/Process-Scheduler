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

  async PreemptiveSJF() {
    while (this.inputProcesses.length) {
      let idx = 0;
      this.inputProcesses.sort((a, b) => {
        if (a.burstTime != b.burstTime) return a.burstTime - b.burstTime;
        else return a.arrivalTime - b.arrivalTime;
      });
      while (this.inputProcesses[idx].arrivalTime > this.count) {
        idx++;
        if (idx == this.inputProcesses.length) {
          this.count++;
          idx = 0;
        }
      }

      this.inputProcesses[idx].burstTime -= 1;

      let sentSegment = {
        processId: this.inputProcesses[idx].processId,
        duration: {
          start: this.count,
          end: this.count + 1,
        },
      };
      await promiseWait(1000);
      this.emit(
        "draw",
        new GUIProcess(
          sentSegment.processId,
          sentSegment.start,
          sentSegment.end
        )
      );
      this.count += 1;
      if (this.inputProcesses[idx].burstTime == 0) {
        this.inputProcesses.splice(idx, 1);
      }
    }
  }
  appendToQueue(process) {
    this.inputProcesses.push(process);
  }
}

module.exports = Algorithm;
