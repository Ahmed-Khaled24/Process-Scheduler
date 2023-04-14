// import { RoundRobin } from "./RoundRobin";
const {RoundRobin}  = require('./RoundRobin.js');
const {InputProcess}  =require('../../util/Process.js');
    

function initializeProcesses(num_processes){
        let processes = [];
        const startTime = Date.now();
        for (let index = 0; index < num_processes; index++) {
            const proceses = new InputProcess(index,
                                    Date.now()-startTime+index,
                                    Math.floor(Math.random()*5+1),index);
            
            processes.push(proceses);
        }
        return processes;
    }

function printProcessesInfo(processes){
        for(const process of processes){
            console.log(process.toString());
        }
    }



    // start Time of the algorithm
    let startTime = Date.now();
    let proceses = initializeProcesses(4);
    printProcessesInfo(proceses);

    let algo= new RoundRobin(proceses,3);
    algo.Run();


        
    let tester = [];
    algo.on('draw', (segment) => {
        tester.push(segment);
        console.log(segment);
    }); 

    algo.on('append', (process) => {
        algo.pushProcess(process);
    })

    algo.on('drawAll', (arr) => {
            console.log(arr);
    })


    algo.on("Done",(Time)=>{
        console.log(Time);
    })

    setTimeout(()=>{
        let processNew = new InputProcess(4,10,5,0,0);
        algo.pushProcess(processNew);
        console.log(`New ${processNew.toString()}`);
    },2000);
    // setInterval(()=>{
        
    // })