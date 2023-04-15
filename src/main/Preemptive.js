const Scheduler = require("./Scheduler");
const { GUIProcess } = require("./process");

function promiseWait(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

class Preemptive extends Scheduler {
  constructor(inputProcesses) {
    super(inputProcesses);
  }
  async start({ Algorithm, Live }) {
    switch (Algorithm) {
      case "priority":
        await this.#runsjf({
          // Live: Live,
          // SortingParam1: "priority",
          // SortingParam1: "arrivalTime",
        });
        break;
      case "sjf":
        await this.#runsjf({
          Live: Live,
          SortingParam1: "burstTime",
          SortingParam2: "arrivalTime",
        });
        break;
    }
  }

  async #runsjf({ Live, SortingParam1, SortingParam2 }) {
    let resultArr = [];
    while (true) {
      let idx = 0;
      let timeout = 0;
      let emittedProcess = null;
      let flag = false;
      this.inputProcesses.sort((a, b) => {
        if (a[SortingParam1] != b[SortingParam1])
          return a[SortingParam1] - b[SortingParam1];
        else return a[SortingParam2] - b[SortingParam2];
      });

      while (this.inputProcesses.length == 0) {
        if (Live) await promiseWait(1000);
        this.count++;
        timeout++;
        if (timeout == 10) {
          flag = true;
          if (Live) {
            let formattedArr = this.formatCalculation(resultArr);
            this.emit("done", {
              WaitngTime: this.calculateAvgWaitingTime(formattedArr),
              TurnAroundTime: this.calcAvgTurnAroundTime(formattedArr),
            });
          }

          break;
        }
      }

      while (
        this.inputProcesses.length != 0 &&
        this.inputProcesses[idx].arrivalTime > this.count
      ) {
        idx++;
        if (idx == this.inputProcesses.length) {
          if (Live) await promiseWait(1000);
          this.count++;
          idx = 0;
        }
      }
      if (flag) {
        break;
      }

      let currentProcess = {
        process: this.inputProcesses[idx],
        processId: this.inputProcesses[idx].processId,
        duration: {
          start: this.count,
          end: this.count + 1,
        },
      };

      emittedProcess = new GUIProcess(
        currentProcess.processId,
        currentProcess.duration.start,
        currentProcess.duration.end,
        currentProcess.process.arrivalTime,
        this.inputProcesses[idx].burstTime
      );
      this.inputProcesses[idx].burstTime -= 1;
      if (Live) {
        await promiseWait(1000);
        this.emit("draw", emittedProcess);
      }
      this.count += 1;
      resultArr = [...resultArr, emittedProcess];

      if (this.inputProcesses[idx].burstTime == 0) {
        this.inputProcesses.splice(idx, 1);
      }
    }

    if (!Live) {
      this.emit("drawAll", resultArr);
      let formattedArr = this.formatCalculation(resultArr);
      this.emit("done", {
        WaitngTime: this.calculateAvgWaitingTime(formattedArr),
        TurnAroundTime: this.calcAvgTurnAroundTime(formattedArr),
      });
    }
  }
}

module.exports = Preemptive;
