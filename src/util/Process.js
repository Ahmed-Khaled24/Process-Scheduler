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
    constructor(processId,start, end) {
        this.processId = processId;
        this.start = start;
        this.end = end;
    }
}


module.exports = { InputProcess, GUIProcess };