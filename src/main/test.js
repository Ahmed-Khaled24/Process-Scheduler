const Scheduler = require("./Scheduler");
const Preemptive = require("./Preemptive");
const { InputProcess } = require("./process");

const p1 = new InputProcess(1, 0, 2, 6);
const p2 = new InputProcess(2, 0, 4, 2);
const p3 = new InputProcess(3, 2, 1, 2);
const p4 = new InputProcess(4, 2, 3, 2);
const p5 = new InputProcess(5, 3, 2, 2);

const processes = [p1, p2, p3, p4, p5];

const alg = new Preemptive(processes);
const tester = [];
alg.on("draw", (segment) => {
  tester.push(segment);
  console.log(segment);
});

alg.on("drawAll", (segment) => {
  tester.push(segment);
  console.log(segment);
});
alg.on("append", (process) => {
  alg.appendToQueue(process);
});

alg.on("done", (obj) => {
  console.log(obj);
});

alg.start({ Algorithm: "sjf", Live: false });
