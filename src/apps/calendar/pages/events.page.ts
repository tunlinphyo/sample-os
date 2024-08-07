import { Modal } from "../../../components/modal"
// import { Page } from "../../../components/page"
import { CalendarController } from "../../../controllers/calendar.controller"
import { DeviceController } from "../../../device/device"
import { HistoryStateManager } from "../../../device/history.manager"
import { EventsService } from "../services/events.service"



export class EventsPage extends Modal {
    private eventsService: EventsService;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private calendar: CalendarController
    ) {
        super(history, { /* btnStart: 'today', btnEnd: 'add' */ });

        this.component.classList.add('eventsPage');
        this.component.style.zIndex = "1";
        this.mainArea.classList.add('swipable');

        this.eventsService = new EventsService(
            this.device,
            this.mainArea,
            (date) => this.calendar.getEvents(date),
            (date: Date) => {
                this.history.updateState('/events', date);
                this.calendar.eventDay = date;
            },
        );

        this.init()
    }

    private init() {
        // this.addEventListener('click', () => {
        //     this.eventsService.date = new Date();
        // }, this.btnStart, false);

        // this.addEventListener('click', () => {
        //     this.history.pushState("/events/new", null);
        // }, this.btnEnd, false);

        const calendarListener = (status: string) => {
            switch (status) {
                // case 'EVENTS_DATE_CHANGE':
                case 'EVENT_UPDATED':
                case 'EVENT_DELETED':
                    this.eventsService.update();
                    break;
            }
        };

        this.eventsService.addChangeListener((status: string, data: any) => {
            if (status === "OPEN_EVENT") {
                this.history.pushState('/events/detail', data);
            }
            if (status === "NEW_EVENT") {
                this.history.pushState("/events/new", data);
            }
        })

        this.calendar.addChangeListener(calendarListener);

        this.device.addEventListener('closeApp', () => {
            this.calendar.removeChangeListener(calendarListener);
        });
    }

    render(eventDate: Date) {
        this.eventsService.init(eventDate);
    }

    update() {}
}
