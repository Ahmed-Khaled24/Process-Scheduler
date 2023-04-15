const Scheduler = require("./Scheduler");
const { GUIProcess } = require("./Process");

function promiseWait(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

class nonPreemptive extends Scheduler {
  constructor(inputProcesses) {
    super(inputProcesses);
  }
  async start({ Algorithm, Live }) {
    switch (Algorithm) {
      case "priority":
        await this.#run({ Live: Live, SortingParam: "priority" });
        break;
      case "sjf":
        await this.#run({ Live: Live, SortingParam: "burstTime" });
        break;
      case "fcfs":
        await this.#run({ Live: Live, SortingParam: "arrivalTime" });
        break;
      default:
        break;
    }
  }

  async #run({ Live, SortingParam }) {
    // Helper Flags
    let CPU = false; // CPU is free
    let currentProcess = null; // Current Process hogging CPU
    let timeout = 0; // Timeout counter
    let emittedProcess = null; // Process to be emitted
    let resultArr = []; // Array of processes  emitted

    // Main Loop
    while (true) {
      // Check if all processes are done
      if (this.inputProcesses.length === 0) {
        timeout++;
      } else {
        timeout = 0;
      }
      // Break if timeout is reached
      if (timeout === 10) {
        let formattedArr = this.formatCalculation(resultArr);
        this.emit("done", {waiting: this.calculateAvgWaitingTime(formattedArr), turnaround: this.calcAvgTurnAroundTime(formattedArr)});
        // this.emit("done", formattedArr);
        break;
      }
      // Filter processes that have arrived
      let filteredProcesses = this.inputProcesses.filter(
        (process) => process.arrivalTime <= this.count
      );
      // Sort processes by priority
      filteredProcesses.sort((a, b) => {
        // if (!(a[SortingParam] - b[SortingParam])) {
        //   return a.arrivalTime - b.arrivalTime;
        // } else {
        //   return a[SortingParam] - b[SortingParam];
        // }
        return a[SortingParam] - b[SortingParam] ? a[SortingParam] - b[SortingParam] : a.arrivalTime - b.arrivalTime? a.arrivalTime - b.arrivalTime : a.processId - b.processId;
      });

      // Check if there are any processes that have arrived
      if (filteredProcesses.length === 0) {
        // Check if CPU is free
      } else if (currentProcess === null) {
        currentProcess = {
          process: filteredProcesses[0],
          start: this.count,
          end: this.count + filteredProcesses[0].burstTime,
        };
        emittedProcess = new GUIProcess(
          currentProcess.process.processId,
          this.count,
          this.count + 1,
          currentProcess.process.arrivalTime
          
        );
        CPU = true;
      } else {
        // Check if current process is done
        if (this.count === currentProcess.end) {
          this.inputProcesses = this.inputProcesses.filter(
            (process) => process.processId !== currentProcess.process.processId
          );
          currentProcess = null;
          CPU = false;
          continue;
        } else {
          emittedProcess = new GUIProcess(
            currentProcess.process.processId,
            this.count,
            this.count + 1,
            currentProcess.process.arrivalTime

          );
        }
      }

      // Emit event
      if (emittedProcess) {
        if (Live) this.emit("draw", emittedProcess);
        resultArr = [...resultArr, emittedProcess];
        emittedProcess = null;
      }

      // Wait for 1 second if live option selected
      if (Live) {
        await promiseWait(1000);
      }
      // Increment time
      this.count++;
    }

    if (!Live) {
      //remove duplicate processes

      this.emit("drawAll", resultArr);
    }
  }
}

module.exports = nonPreemptive;
