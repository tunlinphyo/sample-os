import { App } from "../../../components/app";
import { ScrollBar } from "../../../components/scroll-bar";
import { ClockController } from "../../../controllers/clock.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Alarm, RepeatOption } from "../../../stores/alarm.store";
import { OSArray } from "../../../utils/arrays";
import { OSDate } from "../../../utils/date";

export class ClockApp extends App {
    private hourHand: HTMLElement;
    private minuteHand: HTMLElement;
    private secondHand: HTMLElement;
    private alarmList: HTMLElement;
    private scrollBar?: ScrollBar;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private clock: ClockController
    ) {
        super(history, { btnStart: 'timer_play', btnCenter: 'alarm_add', btnEnd: 'timer' })
        this.init();

        this.component.classList.add('clockPage');

        this.hourHand = this.getElement('.hour-hand');
        this.minuteHand = this.getElement('.minute-hand');
        this.secondHand = this.getElement('.second-hand');
        this.alarmList = this.getElement('.alarmList');

        this.setClock();
        const now = new Date();
        const delay = 1000 - now.getMilliseconds();
        setTimeout(() => {
            this.setClock();
            setInterval(() => this.setClock(), 1000);
        }, delay);
        this.render(this.clock.alarms);
    }

    private init() {
        this.mainArea.innerHTML = `
            <div class="scrollArea">
                <div class="clockArea">
                    <div class="clock">
                        <div class="clock-face">
                            <div class="hand hour-hand"><span></span></div>
                            <div class="hand minute-hand"><span></span></div>
                            <div class="hand second-hand"><span></span></div>
                        </div>
                    </div>
                </div>
                <div class="alarmList"></div>
            </div>`;


        this.addEventListener('click', () => {
            this.history.pushState('/timer', this.clock.timer);
        }, this.btnStart, false);

        this.addEventListener('click', () => {
            this.history.pushState('/alarm', null);
        }, this.btnCenter, false);

        this.addEventListener('click', () => {
            this.history.pushState('/stopwatch', this.clock.stopwatch);
        }, this.btnEnd, false);

        const clockListener = (status: string, data: any) => {
            switch (status) {
                case 'ALARM_LOADED':
                case 'UPDATE_ALARM':
                    this.update('update', data)
                    break;
            }
        };

        this.clock.addChangeListener(clockListener);

        this.device.addEventListener('closePage', () => {
            this.clock.removeChangeListener(clockListener);
        });
    }

    render(alarms: Alarm[]) {
        this.alarmList.classList.add('bordered');
        for(const alarm of this.sortByTime(alarms)) {
            const alarmItem = this.createElement('div', ['alarmItem']);
            const alarmBtn = this.createElement('button', ['alermButton']);
            const timeEL = this.createElement('div', ['clock']);
            if (this.device.hour12) {
                timeEL.innerHTML = `${this.getHours(alarm.time)}:${String(this.getMinutes(alarm.time)).padStart(2, '0')}
                    <small>${alarm.time.getHours() < 12 ? 'AM' : 'PM'}</small>`;
            } else {
                timeEL.innerHTML = `${this.getHours(alarm.time)}:${String(this.getMinutes(alarm.time)).padStart(2, '0')}`;
            }

            let repeat = ''
            if (alarm.repeat.length) {
                repeat = this.getDays(alarm.repeat);
            }
            const labelEl = this.createElement('div', ['label']);
            labelEl.textContent = `${alarm.label}${repeat ? ':' : ''} ${repeat}`;

            alarmBtn.appendChild(timeEL);
            alarmBtn.appendChild(labelEl);

            const toggleBtn = this.createElement('button', ['toggleButton'], { 'data-toggle': alarm.active ? 'on' : 'off' });

            alarmItem.appendChild(alarmBtn);
            alarmItem.appendChild(toggleBtn);

            this.addEventListener('click', () => {
                this.history.pushState('/alarm', alarm.id);
            }, alarmBtn)

            this.addEventListener('click', () => {
                this.clock.updateAlarm({ ...alarm, active: !alarm.active });
            }, toggleBtn)

            this.alarmList.appendChild(alarmItem);
        }
        if (!this.scrollBar) {
            this.scrollBar = new ScrollBar(this.component);
        } else {
            this.scrollBar?.reCalculate();
        }
        // const addAlarm = this.createElement("button", ['addAlarm']);
        // addAlarm.innerHTML = `<span class="material-symbols-outlined icon">alarm_add</span> Add Alarm`;
        // this.addEventListener('click', () => {
        //     this.history.pushState('/alarm', null);
        // }, addAlarm);

        // this.alarmList.appendChild(addAlarm);
    }

    update(_: string, alarms: Alarm[]) {
        this.alarmList.innerHTML = '';
        this.removeAllEventListeners();
        this.render(alarms);
    }

    private setClock() {
        // const time = new Date('Thu Dec 05 2024 12:00:00 GMT+0900');
        const now = new OSDate().getDateByTimeZone(this.device.timeZone);

        const seconds = now.getSeconds();
        const secondsDegrees = ((seconds / 60) * 360) + 90; // Offset by 90 degrees
        this.secondHand.style.transform = `rotate(${secondsDegrees}deg)`;

        const minutes = now.getMinutes();
        const minutesDegrees = ((minutes / 60) * 360) + ((seconds / 60) * 6) + 90;
        this.minuteHand.style.transform = `rotate(${minutesDegrees}deg)`;

        const hours = now.getHours();
        const hoursDegrees = ((hours / 12) * 360) + ((minutes / 60) * 30) + 90;
        this.hourHand.style.transform = `rotate(${hoursDegrees}deg)`;
    }

    private sortByTime(dates: Alarm[]): Alarm[] {
        return [...dates].sort((a, b) => {
            const timeA = a.time.getHours() * 3600 + a.time.getMinutes() * 60;
            const timeB = b.time.getHours() * 3600 + b.time.getMinutes() * 60;
            return timeA - timeB;
        });
    }

    private getHours(time: Date) {
        const dateUTC = new OSDate(time).getDateByTimeZone(this.device.timeZone);
        const hours = dateUTC.getHours();

        return this.device.hour12 ? hours % 12 || 12 : hours;
    }

    private getMinutes(time: Date) {
        const dateUTC = new OSDate(time).getDateByTimeZone(this.device.timeZone);
        return dateUTC.getMinutes();
    }

    private getDays(options: RepeatOption[]) {
        const list = options.map(item => item.toString());
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        if (list.length == 7) {
            return 'Every day';
        } else if (OSArray.isEqualItems(list, ['0', '6'])) {
            return 'Weekends';
        } else if (OSArray.isEqualItems(list, ['1', '2', '3', '4', '5'])) {
            return 'Weekdays';
        } else {
            const sortedList = list.sort().map(item => days[parseInt(item)]);
            if (sortedList.length > 1) {
                const lastDay = sortedList.pop();
                return `${sortedList.join(', ')} and ${lastDay}`;
            } else {
                return sortedList[0];
            }
        }
    }
}
