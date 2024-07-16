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
                        const eventsData = this.calendar.setEventsData(state);
                        this.eventsPage.openPage('Events', eventsData);
                    }
                }, {
                    pattern: '/events/new',
                    callback: () => {
                        const date = OSDate.getNextIncrementTime(this.calendar.eventDay);
                        this.eventEdit.openPage('New Events', date);
                    }
                },  {
                    pattern: '/events/edit',
                    callback: () => {
                        const event = this.calendar.getEvent(state);
                        this.eventEdit.openPage('Edit Events', event);
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
            // console.log('OPEN_PAGE', history);
            this.history.init(history);
            history.forEach((item: HistoryState) => {
                handleChange(item.state, item.url);
            })
        })

        this.device.addEventListener('closeApp', () => {
            // console.log('CLOSE_PAGE', JSON.stringify(this.history.history));
            this.device.setHistory('calendar', this.history.history);
        });

    }
}