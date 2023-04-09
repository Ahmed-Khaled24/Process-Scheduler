 const {ipcRenderer} = require('electron');
 const exitBtn = document.getElementById('exit');
 const nextBtn = document.getElementById('next');
 const algoTypes = document.querySelectorAll('input[name="main-question"]');

 exitBtn.addEventListener('click', () => {
        ipcRenderer.send('exit');
 })

 nextBtn.addEventListener('click', () => {
    algoTypes.forEach(algoType => {
        if (algoType.checked) {
            ipcRenderer.send('gotoAlgorithmWindow', algoType.value);
        }
    });
})

algoTypes.forEach(type => {
    type.addEventListener('change', () => {
        console.log('algorithm selected');
        nextBtn.disabled = false;
    });
})