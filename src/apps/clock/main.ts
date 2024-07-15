import '../../style.css';
import './clock.css';

import { HistoryStateManager } from '../../device/history.manager';
import { ClockAppController } from './app.controller';
import { AlarmEdit } from './pages/alarm.page';
import { ClockApp } from './pages/app.page';
import { StopwatchPage } from './pages/stopwatch.page';
import { TimerPage } from './pages/timer.page';

document.body.dataset.schema = parent.device.theme;

document.addEventListener('DOMContentLoaded', () => {
    const historyManager = new HistoryStateManager();

    new ClockApp(historyManager, parent.device, parent.clock);
    const alarmEdit = new AlarmEdit(historyManager, parent.device, parent.clock);
    const stopwatchPage = new StopwatchPage(historyManager, parent.device, parent.clock);
    const timerPage = new TimerPage(historyManager, parent.device, parent.clock);

    new ClockAppController(
        historyManager,
        parent.device,
        parent.clock,
        alarmEdit,
        stopwatchPage,
        timerPage
    );
});