/// <reference lib="webworker" />
import { CountdownTimer } from './countdown-timer';

let timer: CountdownTimer | null = null;

addEventListener('message', (event) => {
    const { command, data } = event.data;

    console.log('EVENT_DATA', command, data);

    switch (command) {
        case 'init':
            timer = new CountdownTimer();
            console.log("TIMER_INIT", data);
            timer.init(data);
            break;
        case 'start':
            timer?.start();
            break;
        case 'stop':
            timer?.stop();
            break;
        case 'reset':
            timer?.reset(data);
            break;
        case 'getRemainingTime':
            const remainingTime = timer?.getRemainingTime();
            postMessage({ command: 'remainingTime', remainingTime });
            break;
    }
});