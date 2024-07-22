import { CalendarController } from "../../controllers/calendar.controller";
import { DeviceController } from "../../device/device";
import { HistoryState, HistoryStateManager } from "../../device/history.manager";
import { OSDate } from "../../utils/date";
import { EventEditPage } from "./pages/event.edit.page";
import { EventPage } from "./pages/event.page";
import { EventsPage } from "./pages/events.page";


export class CalendarAppController {
    constructor(
        private history: HistoryStateManager,
        private device: DeviceController,
        private calendar: CalendarController,
        private eventsPage: EventsPage,
        private eventPage: EventPage,
        private eventEdit: EventEditPage
    ) {
        this.renderListeners();
    }

    private renderListeners() {
        const handleChange = (state: any, url: string) => {
            this.history.handleChange(url, [
                {
                    pattern: '/events',
                    callback: () => {
                        this.eventsPage.openPage('Events', state);
                    }
                }, {
                    pattern: '/events/new',
                    callback: () => {
                        const timezoneDate = new OSDate(this.calendar.eventDay).getDateByTimeZone(this.device.timeZone);
                        const date = OSDate.getNextIncrementTime(timezoneDate, 30, this.device.timeZone);
                        this.eventEdit.openPage('New Event', state || date);
                    }
                },  {
                    pattern: '/events/edit',
                    callback: () => {
                        this.eventEdit.openPage('Edit Event', state);
                    }
                }, {
                    pattern: '/events/detail',
                    callback: () => {
                        const event = this.calendar.getEventData(state);
                        this.eventPage.openPage('Event', event);
                    }
                },
            ]);
        }

        this.history.onStateChange(handleChange);

        this.device.addEventListener('openAppFinished', () => {
            const history = parent.device.getHistory('calendar');
            if (!history) return;
            this.history.init(history);
            history.forEach((item: HistoryState) => {
                handleChange(item.state, item.url);
            })
        })

        this.device.addEventListener('closeApp', () => {
            this.device.setHistory('calendar', this.history.history);
        });

    }
}