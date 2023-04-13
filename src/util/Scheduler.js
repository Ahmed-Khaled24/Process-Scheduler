const { EventEmitter } = require("stream");


// type processes = {
//     processId: number,
//     arrivalTime: number,
//     burstTime: number,
//     priority: number,
// }



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
    for(let i=processes.length - 1; i>=0; i--) {
      if(!resultArr[processes[i].processId]) {
        resultArr[processes[i].processId] = processes[i];
      }else{
        resultArr[processes[i].processId].start = processes[i].start;
      }
    }
    return resultArr;
  }

  calculateAvgWaitingTime(processes) {
    let totalWaitingTime = 0;
    for(const processId in processes){
      totalWaitingTime += (processes[processId].end - processes[processId].arrivalTime) - (processes[processId].end - processes[processId].start);
    }
    let avgWaitingTime = totalWaitingTime / Object.keys(processes).length;

    return avgWaitingTime;
  }
  calcAvgTurnAroundTime(processes) {
    let totalTurnAroundTime = 0;
    for(const processId in processes){
      totalTurnAroundTime += (processes[processId].end - processes[processId].arrivalTime);
    }
    let avgTurnAroundTime = totalTurnAroundTime /  Object.keys(processes).length;
    return avgTurnAroundTime;
  }
}

module.exports = Scheduler;
