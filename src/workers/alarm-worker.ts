/// <reference lib="webworker" />
import { AlarmManager } from "./alarm-manager";

const alarmManager = new AlarmManager();

addEventListener('message', (event) => {
    const { command, data } = event.data;

    switch (command) {
        case 'init':
            alarmManager.items = data;
            break;
        case 'add':
            alarmManager.add(data);
            break;
        case 'delete':
            alarmManager.remove(data);
            break;
        case 'edit':
            alarmManager.update(data);
            break;
    }
});