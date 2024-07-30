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
        console.log('UPDATE', data);
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
            // if (alarm.active && this.isAlarmTime(alarm, now)) {
            //     this.alert(alarm);
            //     if (alarm.repeat.length === 0) {
            //         this.deactivateAlarm(alarm.id);
            //     }
            // }
            if (alarm.active) {
                if (alarm.snoozeActive) {
                    console.log('SNOOZE', alarm)
                    const snoozeTime = new Date(alarm.snoozeTime!);
                    console.log('SNOOZE_TIME', snoozeTime);
                    if (now >= snoozeTime) {
                        this.alert(alarm);
                        if (alarm.repeat.length === 0) {
                            this.deactivateAlarm(alarm.id);
                        } else {
                            this.stopSnoozeAlarm(alarm.id);
                        }
                    }
                } else if (this.isAlarmTime(alarm, now)) {
                    this.alert(alarm);
                    if (alarm.repeat.length === 0) {
                        this.deactivateAlarm(alarm.id);
                    }
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
            alarm.snoozeActive = false;
            alarm.snoozeTime = undefined;
            postMessage({ status: 'updateAlarm', data: alarm });
        }
    }

    private async stopSnoozeAlarm(id: string) {
        const alarm = this.items.find(alarm => alarm.id === id);
        if (alarm) {
            alarm.snoozeActive = false;
            alarm.snoozeTime = undefined;
            postMessage({ status: 'updateAlarm', data: alarm });
        }
    }

    snooze(alarmId: string, minutes: number) {
        const alarm = this.items.find(alarm => alarm.id === alarmId);
        if (alarm) {
            const now = new Date();
            alarm.snoozeTime = new Date(now.getTime() + minutes * 60000);
            alarm.active = true;
            alarm.snoozeActive = true;
            postMessage({ status: 'updateAlarm', data: alarm });
        }
    }
}