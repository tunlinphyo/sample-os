/// <reference lib="webworker" />
import { AlarmService } from "../services/alarm.service";

const alarmService = new AlarmService();

addEventListener('message', (event) => {
    const { command, data } = event.data;

    switch (command) {
        case 'init':
            alarmService.items = data;
            break;
        case 'add':
            alarmService.add(data);
            break;
        case 'delete':
            alarmService.remove(data);
            break;
        case 'edit':
            alarmService.update(data);
            break;
        case 'snooze':
            alarmService.snooze(data, 4);
            break;
    }
});