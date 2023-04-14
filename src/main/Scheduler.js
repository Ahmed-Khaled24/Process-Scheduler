const { EventEmitter } = require("stream");

class Scheduler extends EventEmitter {
  constructor(inputProcesses) {
    super();
    this.inputProcesses = inputProcesses;
    this.count = 0;
  }

  appendToQueue(process) {
    this.inputProcesses.push(process);
  }

  formatCalculation(processes) {
    let resultArr = {};
    // filter duplicates in the processes
    for (let i = 0; i < processes.length; i++) {
      if (!resultArr[processes[i].processId]) {
        resultArr[processes[i].processId] = processes[i];
      } else {
        resultArr[processes[i].processId].end = processes[i].end;
      }
    }
    return resultArr;
  }

  calculateAvgWaitingTime(processes) {
    let totalWaitingTime = 0;
    for (const processId in processes) {
      totalWaitingTime +=
        processes[processId].end -
        processes[processId].arrivalTime -
        processes[processId].burstTime;
    }
    let avgWaitingTime = totalWaitingTime / Object.keys(processes).length;

    return avgWaitingTime;
  }
  calcAvgTurnAroundTime(processes) {
    let totalTurnAroundTime = 0;
    for (const processId in processes) {
      totalTurnAroundTime +=
        processes[processId].end - processes[processId].arrivalTime;
    }
    let avgTurnAroundTime = totalTurnAroundTime / Object.keys(processes).length;
    return avgTurnAroundTime;
  }
}

module.exports = Scheduler;
