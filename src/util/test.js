const Algorithm = require('../util/algorithm');

const processes = [
    {
      processId: 1,
      arrivalTime: 3,
      burstTime: 3,
      priorityy: 3,
    },
    {
      processId: 2,
      arrivalTime: 1,
      burstTime: 3,
      priorityy: 2,
    },
    {
      processId: 3,
      arrivalTime: 2,
      burstTime: 3,
      priorityy: 1,
    },
  ];

const alg = new Algorithm(processes);
const tester = [];
alg.on('draw', (segment) => {
    tester.push(segment);
}); 

alg.nonPreemptivePriority();