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
    set eventDay(date: Date | "today" | "prev" | "next") {
        if (typeof date === "string") {
            if (date === "today") this.eventStore.eventDay = new Date();
            else this.eventStore.changeDateByOneDay(date === "next")
        } else {
            this.eventStore.eventDay = date;
        }
        const events = this.eventStore.getEvents();
        this.notifyListeners('EVENTS_DATE_CHANGE', { events, eventDate: this.eventDay });
    }

    private setupListeners() {
        this.eventStore.listen((list) => {
            this.events = list;
        });
    }

    public getActives(date: Date) {
        return this.eventStore.getActiveDates(date);
    }

    public getEventsData(eventDate: Date) {
        const events = this.eventStore.getEvents();
        return { events, eventDate };
    }

    public setEventsData(eventDate: Date) {
        this.eventDay = eventDate;
        const events = this.eventStore.getEvents();
        return { events, eventDate };
    }

    public getEventData(id: string) {
        const event = this.eventStore.get(id);
        return { event, eventDay: this.eventDay };
    }

    public getEvent(id: string) {
        return this.eventStore.get(id);
    }

    public updateEvent(event: CalendarEvent) {
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

    public deleteEvent(id: string) {
        this.tryThis(async () => {
            await this.eventStore.del(id);
            this.notifyListeners('EVENT_DELETED', id);
        });
    }
}