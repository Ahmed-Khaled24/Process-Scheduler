const Algorithm = require("./algorithm");

const Scheduler = require("./algorithm");
const { InputProcess } = require("./process");

const p1 = new InputProcess(1, 0, 2, 1);
const p2 = new InputProcess(2, 4, 5, 2);
const p3 = new InputProcess(3, 5, 2, 3);

const processes = [p1, p2, p3];
const alg = new Algorithm(processes);
const tester = [];
alg.on("draw", (segment) => {
  tester.push(segment);
  console.log(segment);
});

alg.on("drawAll", (segment) => {
  console.log(segment);
});

setTimeout(() => {
  alg.appendToQueue(new InputProcess(4, 2, 1, 1));
}, 0);
setTimeout(() => {
  alg.appendToQueue(new InputProcess(5, 15, 1, 1));
}, 0);
// setTimeout(() => {
//   alg.appendToQueue(new InputProcess(6, 26, 1, 1));
// }, 26000);
alg.PreemptiveSJF(true);
