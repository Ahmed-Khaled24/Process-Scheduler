const nonPreemptive = require('./NonPreemptive');
const { InputProcess } = require('./Process');

const p1 = new InputProcess(1, 0, 2, 6);
const p2 = new InputProcess(5, 1, 4, 2);
const p3 = new InputProcess(3, 1, 3, 2);
const p4 = new InputProcess(4, 1, 5, 2);
const p5 = new InputProcess(2, 0, 1, 1);

const processes = [
    p1,
    p2,
    p3,
    p4,
    p5
  ];

const alg = new nonPreemptive(processes);

alg.on('draw', (segment) => {
    console.log(segment);
}); 

alg.on('drawAll', (processes) => {
    console.log(processes);
}); 

alg.on('append', (process) => {
    alg.appendToQueue(process);
})

alg.on('done', (obj) => {
    console.log(obj);
});

alg.start({ Algorithm: 'priority', Live: false});
