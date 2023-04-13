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
async sjfNonpreem(islive){
  let time = Math.min( ...this.inputProcesses.map( p => p.arrivalTime ) );
  var waiting=[];
   var turn =[];
   var counter=0;
while ( this.inputProcesses.find( p => p.Finished == null ) ) {
  let execute = this.inputProcesses.reduce( ( ni, p, i ) => {
    if ( p.Finished == null && p.arrivalTime <= time && (ni === -1 || p.burstTime < this.inputProcesses[ ni ].burstTime ) ) {
      ni = i;
    }
    return ni;
  }, -1 );
  // Capture the start time...
  this.inputProcesses[ execute ].Started = time;
  // ...and then calculate the finish time.
  time += this.inputProcesses[ execute ].burstTime;
  this.inputProcesses[ execute ].Finished = time;
  waiting.push(this.inputProcesses[execute].Started-this.inputProcesses[execute].arrivalTime);
  turn.push(this.inputProcesses[execute].Finished-this.inputProcesses[execute].arrivalTime);
  if(islive){
  counter=this.inputProcesses[ execute ].Started; 
  for(var i=0;i<this.inputProcesses[ execute ].burstTime;i++){
    counter++;
    await promiseWait(1000);
    this.emit("draw", new GUIProcess(this.inputProcesses[execute].processId, counter-1, counter));
}
}
else{
  this.emit("draw", new GUIProcess(this.inputProcesses[execute].processId, this.inputProcesses[execute].Started, this.inputProcesses[execute].Finished));
}
}
//determine waiting and turn around time 
const waitingg = waiting.reduce((result,number)=> result+number)/(waiting.length);
const turnn = turn.reduce((result,number)=> result+number)/(turn.length);
this.emit("draw", "average waiting:"+waitingg +"\naverage turn around:"+turnn);
// For ease of viewing, sort by Started.
this.inputProcesses.sort( ( a, b ) => a.Started - b.Started );
}
  appendToQueue(process) {
    this.inputProcesses.push(process);
  }
}

module.exports = Scheduler;
