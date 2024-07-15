import { App } from "../../../components/app";
import { CalendarRenderer } from "../../../components/calendar";
import { CalendarController } from "../../../controllers/calendar.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";


export class CalendarApp extends App {
    private calendarRenderer: CalendarRenderer;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private calendar: CalendarController
    ) {
        super(history, { template: 'calendarTemplate', btnStart: 'today', btnEnd: 'add' });

        this.onCallback = this.onCallback.bind(this);
        this.calendarRenderer = new CalendarRenderer(this.device, this.mainArea, this.onCallback);
        this.mainArea = this.getElement('#journalDays');
        this.init();
    }

    private init() {
        this.render(this.calendar.eventDay);

        this.addEventListener('click', () => {
            this.calendar.eventDay = "today";
        }, this.btnStart, false);

        this.addEventListener('click', () => {
            this.history.setUrl('/events/new', null);
        }, this.btnEnd, false);

        this.calendarRenderer.listen<Date>('onDateClick', (data) => {
            if (!data) return;
            this.history.setUrl('/events', data);
        });

        this.calendarRenderer.listen<Date>('viewDateChange', (data) => {
            if (!data) return;
            this.calendar.eventDay = data;
        });


        const calendarListener = (status: string, data: any) => {
            switch (status) {
                case 'EVENTS_DATE_CHANGE':
                case 'EVENT_UPDATED':
                case 'EVENT_DELETED':
                    this.update('update', data.eventDate)
                    break;
            }
        };

        this.calendar.addChangeListener(calendarListener);

        this.device.addEventListener('closeApp', () => {
            this.calendar.removeChangeListener(calendarListener);
        });
    }

    async onCallback(date: Date): Promise<Date[]> {
        return this.calendar.getActives(date);
    }

    render(data?: Date) {
        if (!data) data = new Date();
        this.calendarRenderer.data = data || new Date();
    }

    update(_: string, data: Date) {
        this.render(data)
    }
}
