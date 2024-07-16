/// <reference lib="webworker" />

import { TimerService } from "../services/timer.service";

let timer: TimerService | null = null;

addEventListener('message', (event) => {
    const { command, data } = event.data;

    console.log('EVENT_DATA', command, data);

    switch (command) {
        case 'init':
            timer = new TimerService();
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