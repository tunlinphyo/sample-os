import { DB } from "./db";
import { BaseManager, ChangeListener } from "./data";
import { OSDate } from "../utils/date";

export type RepeatType = 'never' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
export type EndRepeatType = 'never' | 'date';

export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    location?: string;
    startTime: Date;
    endTime: Date;
    allDay?: boolean;
    repeat: RepeatType;
    endRepeat: EndRepeatType;
    until?: Date;
    customRepeatRule?: string;
}

export class CalendarEventStore extends BaseManager<CalendarEvent> {
    private db: DB<CalendarEvent>;
    private viewDay: Date = new Date();

    constructor() {
        super([])
        this.db = new DB<CalendarEvent>('events')
        this.init()
    }

    async init() {
        const items = await this.db.getAll()
        this.setItems(items)
        this.notifyListeners(null, 'loaded');
    }

    get eventDay() {
        return this.viewDay
    }
    set eventDay(date: Date) {
        this.viewDay = date;
        this.notifyListeners(null, 'loaded');
    }

    getActiveDates(date: Date): Date[] {
        const activeDates: Set<string> = new Set();
        const year = date.getFullYear();
        const month = date.getMonth();

        this.items.forEach(event => {
            let currentDate = new Date(event.startTime);
            const untilDate = event.until ? new Date(event.until) : null;
            if (untilDate) untilDate.setDate(untilDate.getDate());

            while (true) {
                if (event.endRepeat === 'date' && untilDate && currentDate > untilDate) break;
                if (currentDate.getFullYear() === year && currentDate.getMonth() === month) {
                    activeDates.add(currentDate.toDateString());
                }

                if (event.repeat === 'never') {
                    break;
                } else if (event.repeat === 'daily') {
                    currentDate.setDate(currentDate.getDate() + 1);
                } else if (event.repeat === 'weekly') {
                    currentDate.setDate(currentDate.getDate() + 7);
                } else if (event.repeat === 'monthly') {
                    currentDate.setMonth(currentDate.getMonth() + 1);
                } else if (event.repeat === 'yearly') {
                    currentDate.setFullYear(currentDate.getFullYear() + 1);
                } else if (event.repeat === 'custom' && event.customRepeatRule) {
                    this.applyCustomRepeatRule(event.customRepeatRule, currentDate);
                }

                // Stop if the current date goes beyond the month
                if (currentDate.getFullYear() > year || (currentDate.getFullYear() === year && currentDate.getMonth() > month)) {
                    break;
                }
            }
        });

        return Array.from(activeDates).map(dateString => new Date(dateString));
    }

    getId(contact: CalendarEvent): string {
        return contact.id;
    }

    setId(contact: CalendarEvent, id: string): CalendarEvent {
        return { ...contact, id };
    }

    changeDateByOneDay(increase: boolean) {
        this.viewDay.setDate(this.viewDay.getDate() + (increase ? 1 : -1));
        this.notifyListeners(null, 'loaded');
    }

    setViewDate(date: Date) {
        this.viewDay = date;
        this.notifyListeners(null, 'loaded');
    }

    async add(item: CalendarEvent) {
        const id = await this.db.post(item)
        this.addItem(id, item)
        return id
    }

    async update(id: string, item: CalendarEvent): Promise<string> {
        await this.db.put(id, item)
        this.editItem(id, item)
        return id
    }

    async del(id: string): Promise<string> {
        await this.db.del(id)
        this.deleteItem(id)
        return id
    }

    public resetStore() {
        return this.db.clear();
    }

    listen(callback: ChangeListener<CalendarEvent>): void {
        this.addChangeListener((items, changedItem, operation) => {
            callback(items, changedItem, operation)
        })
    }

    createEvent(event: CalendarEvent): void {
        this.items.push(event);
    }

    updateEvent(event: CalendarEvent): void {
        const index = this.items.findIndex(e => e.id === event.id);
        if (index !== -1) {
            this.items[index] = event;
        } else {
            throw new Error(`Event with id ${event.id} not found.`);
        }
    }

    deleteEvent(eventId: string): void {
        const index = this.items.findIndex(e => e.id === eventId);
        if (index !== -1) {
            this.items.splice(index, 1);
        } else {
            throw new Error(`Event with id ${eventId} not found.`);
        }
    }

    public getEvents(date?: Date): CalendarEvent[] {
        const today = new OSDate(date || this.viewDay).getYearMonthDay();
        const todayStart = new Date(today.year, today.month, today.day);
        const todayEnd = new Date(today.year, today.month, today.day, 23, 59, 59, 999);

        const todayEvents = this.items.filter(event => {
            const eventStartTime = new Date(event.startTime);
            const eventEndTime = new Date(event.endTime);
            const eventUntil = event.repeat !== 'never' && event.endRepeat !== 'never' ? event.until : null;

            if (eventStartTime <= todayEnd && eventEndTime >= todayStart) {
                return true;
            }

            if (event.repeat === 'daily') {
                return eventStartTime <= todayEnd && (!eventUntil || eventUntil >= todayStart);
            }

            if (event.repeat === 'weekly') {
                const eventDay = eventStartTime.getDay();
                return todayStart.getDay() === eventDay && eventStartTime <= todayEnd && (!eventUntil || eventUntil >= todayStart);
            }

            if (event.repeat === 'monthly') {
                const eventDate = eventStartTime.getDate();
                return today.day === eventDate && eventStartTime <= todayEnd && (!eventUntil || eventUntil >= todayStart);
            }

            if (event.repeat === 'yearly') {
                const eventMonth = eventStartTime.getMonth();
                const eventDate = eventStartTime.getDate();
                return today.month === eventMonth && today.day === eventDate && eventStartTime <= todayEnd && (!eventUntil || eventUntil >= todayStart);
            }

            if (event.repeat === 'custom' && event.customRepeatRule) {
                const customDates = this.generateCustomDates(event.startTime, event.customRepeatRule, event.until);
                return customDates.some(date => date >= todayStart && date <= todayEnd);
            }

            return false;
        });

        // return todayEvents.sort((a, b) => new Date(a.startTime).getHours() - new Date(b.startTime).getHours());
        return todayEvents.sort((a, b) => OSDate.getHMinM(a.startTime) - OSDate.getHMinM(b.startTime));
    }

    private generateCustomDates(startTime: Date, rule: string, until?: Date): Date[] {
        const dates: Date[] = [];
        let currentDate = new Date(startTime);
        const untilDate = until ? new Date(until) : null;

        while (!untilDate || currentDate <= untilDate) {
            dates.push(new Date(currentDate));
            this.applyCustomRepeatRule(rule, currentDate);
        }

        return dates;
    }

    private applyCustomRepeatRule(rule: string, date: Date): void {
        const [interval, unit] = rule.split(' ');

        switch (unit) {
            case 'days':
                date.setDate(date.getDate() + parseInt(interval));
                break;
            case 'weeks':
                date.setDate(date.getDate() + parseInt(interval) * 7);
                break;
            case 'months':
                date.setMonth(date.getMonth() + parseInt(interval));
                break;
            case 'years':
                date.setFullYear(date.getFullYear() + parseInt(interval));
                break;
            default:
                throw new Error(`Unsupported custom repeat unit: ${unit}`);
        }
    }
}