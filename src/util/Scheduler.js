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
async sjfNonpreem(process){
  let time = Math.min( ...process.map( p => p.arrivalTime ) );
while ( process.find( p => p.Finished == null ) ) {
  let execute = process.reduce( ( ni, p, i ) => {
    if ( p.Finished == null && p.arrivalTime <= time && (ni === -1 || p.burstTime < process[ ni ].burstTime ) ) {
      ni = i;
    }
    return ni;
  }, -1 );
  
  // Capture the start time...
  process[ execute ].Started = time;
  // ...and then calculate the finish time.
  time += process[ execute ].burstTime;
  process[ execute ].Finished = time;
  for(var i=0;i<process[ execute ].burstTime;i++){
    await promiseWait(1000);
    this.emit("draw", new GUIProcess(process[execute].processId, process[execute].Started, process[execute].Finished));
}
}

// For ease of viewing, sort by Started.
process.sort( ( a, b ) => a.Started - b.Started );
}
  appendToQueue(process) {
    this.inputProcesses.push(process);
  }
}

module.exports = Scheduler;
