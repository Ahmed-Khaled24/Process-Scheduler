class InputProcess {
    constructor(processId, arrivalTime, burstTime, priority, quantum) {
        this.processId = processId;
        this.arrivalTime = arrivalTime;
        this.burstTime = burstTime;
        this.priority = priority;
        // this.quantum = quantum;
        this.consumedTime = 0;
    }
    toString(){
        return `{PID: ${this.processId}| Arrival: ${this.arrivalTime}| Burst: ${this.burstTime}| Consumed: ${this.consumedTime}}`
    }
}

class GUIProcess {
    constructor(processId,start, end) {
        this.processId = processId;
        this.start = start;
        this.end = end;
    }
}


module.exports = { InputProcess, GUIProcess };