const { EventEmitter } = require("stream");
const {InputProcess,GUIProcess} = require("../../util/Process")


// class InputProcess {
//     constructor(processId, arrivalTime, burstTime, priority, quantum) {
//         this.processId = processId;
//         this.arrivalTime = arrivalTime;
//         this.burstTime = burstTime;
//         this.priority = priority;
//         this.quantum = quantum;
//     }
// }

// class GUIProcess {
//     constructor(processId,start, end) {
//         this.processId = processId;
//         this.start = start;
//         this.end = end;
//     }
// }

class RoundRobin extends EventEmitter{
    #QProcesses;        // running Q
    #QuntumTime;        // QuntumTime to do context switching
    #RefernceTime;      // Time taken to serve all the processes
    #avgTurnAround;     // Average Turn Around Time
    #avgWaitingTime;    // Average Waiting Time 
    #totalProceses;     // Total number of procesess that will be served
    #segments;          // keep track all segments that will be sent to the GUI

    constructor(inputProcesses,QuntumTime){
        super();
        this.#QProcesses = inputProcesses;
        this.#QuntumTime = QuntumTime;
        this.#RefernceTime = 0;
        this.#avgTurnAround = 0;
        this.#avgWaitingTime = 0;
        this.#totalProceses = inputProcesses.length;

        // sort by the arrival Time  
        this.#QProcesses.sort((a,b) => a.arrivalTime - b.arrivalTime);

        this.#segments  = [];        
    }

    async Run(drawAll = false){
        let sumTurnAround = 0;
        let sumWaitingTime = 0;

        while(this.#QProcesses.length){
            let currentRunningProcess = this.#QProcesses[0];
            this.#QProcesses.shift();

            let emittedProcess = new GUIProcess(currentRunningProcess.processId,
                                                this.#RefernceTime,
                                                this.#getEndTime(currentRunningProcess)+this.#RefernceTime);
            if(!drawAll)
                await this.#serveProcess(currentRunningProcess,emittedProcess);
            else{
                await this.#serveProcess(currentRunningProcess,null); 
                this.#segments.push(emittedProcess);
            }   
            
            if(currentRunningProcess.consumedTime < currentRunningProcess.burstTime){
                this.#QProcesses.push(currentRunningProcess);
            }
            else{
                sumTurnAround += this.#RefernceTime -currentRunningProcess.TimeArrival;
                sumWaitingTime += this.#RefernceTime - currentRunningProcess.TimeArrival -currentRunningProcess.BurstTime;
            }

        }
        this.#avgTurnAround = sumTurnAround/this.#totalProceses;
        this.#avgWaitingTime = sumWaitingTime/this.#totalProceses;
        

        if(drawAll)
            this.emit("drawAll",this.#segments);

    }


    
    #getEndTime(process){
        // input:   current running process 
        // output:  the remaining time for the process
        let diff  = (process.burstTime-process.consumedTime)
        let endTime =  diff  < this.#QuntumTime ? diff:this.#QuntumTime;
        return endTime;
    }
    async #serveProcess(RunningProcess,emittedProcess){
        
        for(let i = 0;i<this.#QuntumTime;i++){
            
            if (RunningProcess.consumedTime >= RunningProcess.burstTime) {
                break;
            }

            const waitTime = 1000; 
            await this.#wait(waitTime);
            this.#RefernceTime ++;
            
            if(emittedProcess)
                this.emit('draw',emittedProcess);   // notify the GUI every one second
                
            RunningProcess.consumedTime++;
            if (RunningProcess.consumedTime % this.#QuntumTime === 0) {
                break;
            }

            
        }
    
    }
    async #wait(ms) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    }

    #getCompletePercentage(Process){
        if (!Process.BurstTime)
            return 0;
        else    
            return parseInt(Math.floor((Process.consumedTime/Process.BurstTime)*100));
    }
    pushProcess(Process){
        this.#QProcesses.push(Process);
        this.#totalProceses++;
    }

    get avgTurnAround(){return this.#avgTurnAround;}
    get avgWaitingTime(){return this.#avgWaitingTime;}
}



module.exports = {
    RoundRobin,
};