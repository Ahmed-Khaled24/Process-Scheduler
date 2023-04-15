const { EventEmitter } = require("stream");
const { GUIProcess, TimeCalculation } = require("./Process");

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
        this.totalProcesses = [...this.inputProcesses];
    }

    appendToQueue(process) {
        this.inputProcesses.push(process);
        this.totalProcesses.push(process);
    }
    formatCalculation(processes /* GUIProcess Array */) {
        let formattedArr = {};
        // filter duplicates in the processes
        for (let i = processes.length - 1; i >= 0; i--) {
            if (!formattedArr[processes[i].processId]) {
                formattedArr[processes[i].processId] = processes[i];
            } else {
                formattedArr[processes[i].processId].start = processes[i].start;
            }
        }
        return formattedArr;
    }
    calculateAvgWaitingTime(processes /* Formatted Array */) {
        let totalWaitingTime = 0;
        for (const processId in processes) {
            totalWaitingTime +=
                processes[processId].end -
                processes[processId].arrivalTime -
                (processes[processId].end - processes[processId].start);
        }
        let avgWaitingTime = totalWaitingTime / Object.keys(processes).length;

        return avgWaitingTime;
    }
    calcAvgTurnAroundTime(processes /* Formatted Array */) {
        let totalTurnAroundTime = 0;
        for (const processId in processes) {
            totalTurnAroundTime +=
                processes[processId].end - processes[processId].arrivalTime;
        }
        let avgTurnAroundTime =
            totalTurnAroundTime / Object.keys(processes).length;
        return avgTurnAroundTime;
    }
}

module.exports = Scheduler;
