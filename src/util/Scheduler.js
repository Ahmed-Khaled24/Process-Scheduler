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

  async nonPreemptivePriority(Live) {
    // Helper flags
    let CPU = false;
    let currentProcess = null;
    let timeout = 0;
    let emittedProcess =null;
    let resultArr = [];

    // Main Loop
    while (true) {
      // Check if all processes are done
      if (this.inputProcesses.length == 0) {
        timeout++;
      }
      // Break if timeout is reached
      if (timeout === 10) {
        break;
      }
      // Filter processes that have arrived
      let filteredProcesses = this.inputProcesses.filter(
        (process) => process.arrivalTime <= this.count
      );
      // Sort processes by priority
      filteredProcesses.sort((a, b) => a.priority - b.priority);

      // Wait for 1 second if live option selected
      if(Live){
        await promiseWait(1000);
      }

      // Check if there are any processes that have arrived
      if (filteredProcesses.length == 0) {
        this.count++;
        continue;
        // Check if CPU is free
      } else if (currentProcess === null) {
        currentProcess = {
          process: filteredProcesses[0],
          start: this.count,
          end: this.count + filteredProcesses[0].burstTime,
        };
        emittedProcess = new GUIProcess(currentProcess.process.processId, currentProcess.start, currentProcess.end);
        CPU = true;

      } else {
        // Check if current process is done
        if (this.count == currentProcess.end) {
          this.inputProcesses = this.inputProcesses.filter(
            (process) => process.processId !== currentProcess.process.processId
          );
          currentProcess = null;
          CPU = false;
          this.count--;
        } else {
          emittedProcess = new GUIProcess(currentProcess.process.processId, currentProcess.start, currentProcess.end);
        }
      }
      if(Live){
        this.emit("draw", emittedProcess);
      }else{
        resultArr = [...resultArr, emittedProcess];
      }
      this.count++;
    }

    if(!Live){
      //remove duplicate processes
      resultArr = resultArr.filter((process,index) => {
        return resultArr.findIndex((p) => p.processId === process.processId) === index;
      })
      this.emit("drawAll", resultArr);
    } 
  }

  appendToQueue(process) {
    this.inputProcesses.push(process);
  }
}

module.exports = Scheduler;
