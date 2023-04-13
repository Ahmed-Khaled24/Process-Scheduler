class InputProcess {
    constructor(processId, arrivalTime, burstTime, priority, quantum) {
        this.processId = processId;
        this.arrivalTime = arrivalTime;
        this.burstTime = burstTime;
        this.priority = priority;
        this.quantum = quantum;
    }
}

class GUIProcess {
    constructor(processId,start, end, arrivalTime) {
        this.processId = processId;
        this.start = start;
        this.end = end;
        this.arrivalTime = arrivalTime;
    }
}


module.exports = { InputProcess, GUIProcess };