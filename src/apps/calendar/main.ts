import '../../style.css';
import './calendar.css';

import { HistoryStateManager } from '../../device/history.manager';
import { CalendarApp } from './pages/app.page';
import { EventsPage } from './pages/events.page';
import { CalendarAppController } from './app.controller';
import { EventEditPage } from './pages/event.edit.page';
import { EventPage } from './pages/event.page';

document.body.dataset.schema = parent.device.theme;

document.addEventListener('DOMContentLoaded', () => {
    const historyManager = new HistoryStateManager();

    new CalendarApp(historyManager, parent.device, parent.calendar);
    const eventsPage = new EventsPage(historyManager, parent.device, parent.calendar);
    const eventPage = new EventPage(historyManager, parent.device, parent.calendar);
    const eventEditPage = new EventEditPage(historyManager, parent.device, parent.calendar);

    new CalendarAppController(
        historyManager,
        parent.device,
        parent.calendar,
        eventsPage,
        eventPage,
        eventEditPage
    );
});