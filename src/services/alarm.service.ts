import { Alarm, RepeatOption } from '../stores/alarm.store';

export class AlarmService {
    private _items: Alarm[] = [];
    constructor() {
        this.initInterval();

        this.checkAlarms = this.checkAlarms.bind(this);
        this.updateClock = this.updateClock.bind(this);
    }

    get items() {
        return this._items;
    }
    set items(list: Alarm[]) {
        this._items = list;
    }

    add(data: Alarm) {
        this._items = [ ...this._items, data ];
    }

    remove(data: Alarm) {
        this._items = this._items.filter(item => item.id !== data.id);
    }

    update(data: Alarm) {
        this._items = this._items.map(item => item.id === data.id ? data : item);
    }

    private initInterval() {
        const now = new Date();
        const delay = (60 - now.getSeconds()) * 1000;
        setTimeout(() => {
            this.updateClock();
            this.checkAlarms();
            setInterval(() => {
                this.updateClock();
                this.checkAlarms();
            }, 60000);
        }, delay);
    }

    private checkAlarms() {
        const now = new Date();
        this.items.forEach(alarm => {
            if (alarm.active && this.isAlarmTime(alarm, now)) {
                this.alert(alarm);
                if (alarm.repeat.length === 0) {
                    this.deactivateAlarm(alarm.id);
                }
            }
        });
    }

    private isAlarmTime(alarm: Alarm, now: Date): boolean {
        const alarmTime = new Date(alarm.time);
        return (
            alarmTime.getHours() === now.getHours() &&
            alarmTime.getMinutes() === now.getMinutes() &&
            (alarm.repeat.length === 0 || alarm.repeat.includes(now.getDay() as RepeatOption))
        );
    }

    private alert(alarm: Alarm) {
        postMessage({ status: 'showAlarm', data: alarm });
    }

    private updateClock() {
        postMessage({ status: 'updateClock' });
    }

    private async deactivateAlarm(id: string) {
        const alarm = this.items.find(alarm => alarm.id === id);
        if (alarm) {
            alarm.active = false;
            postMessage({ status: 'updateAlarm', data: alarm });
        }
    }
}