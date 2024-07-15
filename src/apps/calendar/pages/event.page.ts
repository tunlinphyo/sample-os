import { Page } from "../../../components/page";
import { CalendarController } from "../../../controllers/calendar.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { CalendarEvent } from "../../../stores/event.store";
import { OSDate } from "../../../utils/date";


export class EventPage extends Page {
    private event: CalendarEvent | undefined;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private calendar: CalendarController
    ) {
        super(history, { btnStart: 'delete', btnEnd: 'edit' });
        this.init();
    }

    private init() {
        this.addEventListener('click', async () => {
            const result = await this.device.confirmPopup.openPage('Delete Event', 'Are you sure to delete?');
            if (result) this.calendar.deleteEvent(this.event!.id);
        }, this.btnStart, false);

        this.addEventListener('click', () => {
            if (!this.event) return;
            this.history.setUrl('/events/edit', this.event.id);
        }, this.btnEnd, false);

        const calendarListener = (status: string, data: any) => {
            switch (status) {
                case 'EVENT_UPDATED':
                    const eventData = this.calendar.getEventData(data);
                    if (!eventData) return;
                    this.update('update', eventData.event!, eventData.eventDay);
                    break;
                case 'EVENT_DELETED':
                    this.closePage();
                    break;
            }
        };

        this.calendar.addChangeListener(calendarListener);

        this.device.addEventListener('closeApp', () => {
            this.calendar.removeChangeListener(calendarListener);
        });
    }

    render(data: { event: CalendarEvent, eventDay: Date }) {
        this.event = data.event

        const scrollArea = this.createScrollArea()

        const contantArea = this.createElement('div', ['contantArea'])

        const titleEl = this.createElement('h2', ['title'])
        titleEl.textContent = this.event.title

        const fullDate = this.createElement('div', ['paddingTop'])
        fullDate.textContent = OSDate.formatFullDate(data.eventDay, true);

        const rangeEl = this.createElement('div', [])
        rangeEl.textContent = this.event.allDay ? 'All day' : `from ${OSDate.formatTime(this.event.startTime)} to ${OSDate.formatTime(this.event.endTime)}`

        contantArea.appendChild(titleEl)
        contantArea.appendChild(fullDate)
        contantArea.appendChild(rangeEl)

        if (this.event.repeat != 'never') {
            const repeatEl = this.createElement('div', [])
            repeatEl.textContent = `repeat ${this.event.repeat}`
            contantArea.appendChild(repeatEl)
        }

        if (this.event.endRepeat != 'never' && this.event.until) {
            const repeatEndEl = this.createElement('div', [])
            repeatEndEl.textContent = `End at ${OSDate.formatFullDate(this.event.until)}`
            contantArea.appendChild(repeatEndEl)
        }

        if (this.event.description) {
            const lineEl = this.createElement('div', ['line', 'paddingTop'])
            contantArea.appendChild(lineEl)

            const repeatEl = this.createElement('div', ['paddingTop'])
            repeatEl.textContent = this.event.description
            contantArea.appendChild(repeatEl)
        }

        scrollArea.appendChild(contantArea)
        this.mainArea.appendChild(scrollArea)
    }

    update(operation: string, data: CalendarEvent, eventDay: Date) {
        this.mainArea.innerHTML = ''
        this.removeAllEventListeners()

        if (operation === 'delete') {
            this.closePage()
        } else {
            this.render({ event: data, eventDay })
        }
    }
}
