 const {ipcRenderer} = require('electron');
 const exitBtn = document.getElementById('exit');
 const nextBtn = document.getElementById('next');
 const algoTypes = document.querySelectorAll('input[name="main-question"]');

 exitBtn.addEventListener('click', () => {
    ipcRenderer.send('exit');
 })

 nextBtn.addEventListener('click', () => {
    let schedulerType = null;
    for(let algoType of algoTypes) {
        if(algoType.checked) {
            schedulerType = algoType.value;
            break;
        }
    }
    ipcRenderer.send('gotoAlgorithmWindow', schedulerType);
});

algoTypes.forEach(type => {
    type.addEventListener('change', () => {
        nextBtn.disabled = false;
    });
})