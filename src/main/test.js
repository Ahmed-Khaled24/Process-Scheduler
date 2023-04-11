const Algorithm = require("../util/algorithm");

const Scheduler = require("./algorithm");
const { InputProcess } = require("./process");

const p1 = new InputProcess(1, 0, 5, 1);
const p2 = new InputProcess(2, 1, 4, 2);
const p3 = new InputProcess(3, 1, 3, 3);

const processes = [p1, p2, p3];
const alg = new Algorithm(processes);
const tester = [];
alg.on("draw", (segment) => {
  tester.push(segment);
  console.log(segment);
});

setTimeout(() => {
  alg.appendToQueue(new InputProcess(4, 2, 1, 1));
}, 2000);
alg.PreemptiveSJF();
