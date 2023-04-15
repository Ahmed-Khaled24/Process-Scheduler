class InputProcess {
    endTime;
    constructor(processId, arrivalTime, burstTime, priority, quantum) {
        this.processId = processId;
        this.arrivalTime = arrivalTime;
        this.burstTime = burstTime;
        this.priority = priority;
        this.burstTimeObsolete = burstTime;
        this.consumedTime = 0;
    }
    toString(){
        return `{PID: ${this.processId}| Arrival: ${this.arrivalTime}| Burst: ${this.burstTime}| Consumed: ${this.consumedTime}}`
    }
}

class GUIProcess {
    constructor(processId,start, end, arrivalTime, burstTime) {
        this.processId = processId;
        this.start = start;
        this.end = end;
        this.arrivalTime = arrivalTime;
        this.burstTime = burstTime;

    }
}

class TimeCalculation{
    constructor(waitingTime,TurnAround){
        this.waiting = waitingTime;
        this.turnaround = TurnAround;
    }
}

module.exports = { InputProcess, GUIProcess ,TimeCalculation};