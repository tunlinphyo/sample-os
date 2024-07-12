import { HistoryStateManager } from '../../device/history.manager';
import '../../style.css';
import './clock.css';
import { ClockApp } from './pages/app.page';

document.body.dataset.schema = parent.device.theme;

document.addEventListener('DOMContentLoaded', () => {
    const historyManager = new HistoryStateManager();

    new ClockApp(historyManager, parent.device, parent.clock);
});