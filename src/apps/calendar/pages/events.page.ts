import { Page } from "../../../components/page"
import { DatePickerData } from "../../../components/pickers/year.picker"
import { CalendarController } from "../../../controllers/calendar.controller"
import { DeviceController } from "../../../device/device"
import { HistoryStateManager } from "../../../device/history.manager"
import { CalendarEvent } from "../../../stores/event.store"
import { OSDate } from "../../../utils/date"



export class EventsPage extends Page {
    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private calendar: CalendarController
    ) {
        super(history, { btnStart: 'today', btnEnd: 'add' })
        this.init()
    }

    private init() {
        this.addEventListener('click', () => {
            this.calendar.eventDay = "today";
        }, this.btnStart, false);

        this.addEventListener('click', () => {
            this.history.pushState("/events/new", null);
        }, this.btnEnd, false);

        const calendarListener = (status: string) => {
            switch (status) {
                case 'EVENTS_DATE_CHANGE':
                case 'EVENT_UPDATED':
                case 'EVENT_DELETED':
                    const eventData = this.calendar.getEventsData(this.calendar.eventDay);
                    this.update('update', eventData.events, eventData.eventDate);
                    break;
            }
        };

        this.calendar.addChangeListener(calendarListener);

        this.device.addEventListener('closeApp', () => {
            this.calendar.removeChangeListener(calendarListener);
        });
    }

    render({ events, eventDate }: {events: CalendarEvent[]; eventDate: Date}) {
        const scrollArea = this.createScrollArea();
        const dateToggle = this.createElement('div', ['dateToggle']);
        const prevButton = this.createElement('button', ['prevButton']);
        prevButton.innerHTML = '<span class="material-symbols-outlined icon--nu">chevron_left</span>';
        const currentDate = this.createElement('div', ['currentDate']);
        currentDate.textContent = OSDate.formatDate(eventDate, this.device.timeZone, true, true);
        const nextButton = this.createElement('button', ['nextButton']);
        nextButton.innerHTML = '<span class="material-symbols-outlined icon--nu">chevron_right</span>';

        dateToggle.appendChild(prevButton);
        dateToggle.appendChild(currentDate);
        dateToggle.appendChild(nextButton);

        this.addEventListener('click', () => {
            this.calendar.eventDay = "prev";
        }, prevButton);

        this.addEventListener('click', () => {
            this.calendar.eventDay = "next";
        }, nextButton);

        this.addEventListener('click', async () => {
            const ymd = new OSDate(this.calendar.eventDay).getYearMonthDay();
            const date = await this.device.datePicker.openPage('2024', ymd)
            if (date) {
                const d = date as DatePickerData;
                this.calendar.eventDay = new Date(d.year, d.month, d.day);
            }
        }, currentDate);


        const dayArea = this.createElement('div', ['dayArea'])

        const eventList = this.createElement('div', ['eventList'])
        for(const event of events) {
            const eventItem = this.createElement('div', ['eventItem'])
            const clock = this.createElement('div', ['clock'])
            const isOver = this.isOver(event, eventDate)
            clock.textContent = event.allDay ? 'All-day' : new OSDate(event.startTime).getHour();
            const eventName = this.createElement('div', ['eventName']);
            if (isOver) eventName.classList.add('over');
            eventName.textContent = event.title

            eventItem.appendChild(clock)
            eventItem.appendChild(eventName)

            this.addEventListener('click', () => {
                this.history.pushState('/events/detail', event.id);
            }, eventItem)

            eventList.appendChild(eventItem)
        }

        if (!events.length) this.renderNoEvent(eventList, 'No Event');

        // dayArea.appendChild(date)
        dayArea.appendChild(eventList)

        scrollArea.appendChild(dateToggle)
        scrollArea.appendChild(dayArea)

        this.mainArea.appendChild(scrollArea)
    }

    update(_: string, events: CalendarEvent[], eventDate: Date) {
        if (!this.isActive) return;
        this.mainArea.innerHTML = ''
        this.removeAllEventListeners()
        this.render({ events, eventDate })
    }

    protected renderNoEvent(parentEl: HTMLElement, message: string) {
        const msgEl = this.createElement('div', ['noEvent']);
        msgEl.textContent = message;
        parentEl.appendChild(msgEl);
    }

    private isOver(event: CalendarEvent, eventDate: Date) {
        const today = new OSDate(new Date());
        if (today.isOlderThan(eventDate)) {
            return true;
        } else if (today.isSameDay(eventDate)) {
            const now = today.getHourMinutes();
            const end = new OSDate(event.endTime).getHourMinutes();

            return end <= now;
        } else {
            return false;
        }
    }
}
