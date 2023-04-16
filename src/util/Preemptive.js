const Scheduler = require("./Scheduler");
const { GUIProcess, TimeCalculation } = require("./Process");

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
      await this.#runPriority(Live);
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


  async #runPriority(live) {
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

        if (currentProcess !== null && currentProcess.process !== null){
            currentProcess.process.burstTime--;
          }
        // Wait for 1 second if live option selected
        if (live) {
            await promiseWait(1000);
        }
        // Increment time
        this.count++;
    }

    if (!live) {
        this.emit("drawAll", resultArr);
    }
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
            this.emit("done", new TimeCalculation(this.calculateAvgWaitingTime(formattedArr), this.calcAvgTurnAroundTime(formattedArr)));
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
      this.emit("done", new TimeCalculation(this.calculateAvgWaitingTime(formattedArr), this.calcAvgTurnAroundTime(formattedArr)));
    }
  }
}

module.exports = Preemptive;
