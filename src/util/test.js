const Scheduler = require('./Scheduler');
const { InputProcess } = require('./Process');

const p1 = new InputProcess(1, 3, 5, 1);
const p2 = new InputProcess(2, 4, 4, 2);
const p3 = new InputProcess(3, 4, 3, 3);

const processes = [
    p1, 
    p2,
    p3,
  ];

const alg = new Scheduler(processes);
const tester = [];
alg.on('draw', (segment) => {
    tester.push(segment);
    console.log(segment);
}); 
alg.on('append', (process) => {
    alg.appendToQueue(process);
})

alg.on('drawAll', (arr) => {
    console.log(arr);
})
//alg.nonPreemptivePriority();

alg.nonPreemptivePriority();
//short job first non premtive
alg.sjfNonpreem(false);

// setTimeout(() => {
//     alg.appendToQueue(new InputProcess(4, 3, 4, 1));
// }, 3000);

