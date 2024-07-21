import { CalendarEvent, CalendarEventStore } from "../stores/event.store";
import { BaseController } from "./base.controller";

export class CalendarController extends BaseController {
    private _events: CalendarEvent[] = [];
    constructor(
        private eventStore: CalendarEventStore
    ) {
        super();
        this.setupListeners();
    }

    get events() {
        return this._events;
    }
    set events(list: CalendarEvent[]) {
        this._events = list;
    }

    get eventDay(): Date {
        return this.eventStore.eventDay;
    }
    set eventDay(date) {
        this.eventStore.eventDay = date;
        this.notifyListeners('EVENTS_DATE_CHANGE', date);
    }

    private setupListeners() {
        this.eventStore.listen((list) => {
            this.events = list;
        });
    }

    getActives(date: Date) {
        return this.eventStore.getActiveDates(date);
    }

    getEvents(date: Date) {
        return this.eventStore.getEvents(date);
    }

    getEventData(id: string) {
        const event = this.eventStore.get(id);
        return { event, eventDay: this.eventDay };
    }

    getEvent(id: string) {
        return this.eventStore.get(id);
    }

    updateEvent(event: CalendarEvent) {
        this.tryThis(async() => {
            let id: string | undefined;
            if (event.id) {
                id = await this.eventStore.update(event.id, event);
            } else {
                id = await this.eventStore.add(event);
            }
            this.notifyListeners('EVENT_UPDATED', id);
        });
    }

    deleteEvent(id: string) {
        this.tryThis(async () => {
            await this.eventStore.del(id);
            this.notifyListeners('EVENT_DELETED', id);
        });
    }
}