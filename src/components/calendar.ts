import { DeviceController } from "../device/device";
import { EventListenerInfo } from "./base";

export type ActiveDatesCallback = (date: Date) => Promise<Date[]>;

export class CalendarRenderer {
    private year: number;
    private month: number;
    private day: number;
    private timezone: string;
    private containerEl: HTMLElement;
    private bodyEl: HTMLElement;
    private monthEl: HTMLElement;
    private months: string[] = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    private eventListeners: EventListenerInfo[] = [];
    protected customEvents: Set<string> = new Set();
    private _activeDates: Date[] = [];
    private callBack: ActiveDatesCallback | undefined;

    private startX: number = 0;
    private currentX: number = 0;

    constructor(
        private device: DeviceController,
        private component: HTMLElement,
        timezone: string = 'UTC',
        callBack?: ActiveDatesCallback
    ) {
        this.containerEl = this.getElement('.caleandarContainer');
        this.bodyEl = this.getElement('.jsCalendarDays');
        this.monthEl = this.getElement('.currentDate');
        this.timezone = timezone;

        this.callBack = callBack;
        const date = new Date();
        const tzDate = this.toTimezoneDate(date);
        this.year = tzDate.getFullYear();
        this.month = tzDate.getMonth();
        this.day = tzDate.getDate();

        this.init();
        this.touchEventListeners();
    }

    private init() {
        this.addEventListener('click', () => {
            this.data = this.prevMonth();
        }, this.getElement('.prevButton'), false);

        this.addEventListener('click', () => {
            this.data = this.nextMonth();
        }, this.getElement('.nextButton'), false);

        this.addEventListener('click', async () => {
            const result = await this.device.yearPicker.openPage('Year, Month', { year: this.year, month: this.month });
            if (result && typeof result !== 'boolean') {
                this.data = this.toTimezoneDate(new Date(result.year, result.month, 1));
            }
        }, this.getElement('.currentDate'), false);
    }

    private touchEventListeners() {
        this.component.addEventListener('touchstart', (event) => {
            this.startX = event.touches[0].clientX;
            this.currentX = event.touches[0].clientX;
        }, false);

        this.component.addEventListener('touchmove', (event) => {
            this.currentX = event.touches[0].clientX;
            const moveX = this.currentX - this.startX;

            this.containerEl.style.translate = `${this.clampMoveX(moveX)}px 0`;
        }, false);

        this.component.addEventListener('touchend', () => {
            const moveX = this.startX - this.currentX;
            console.log('END', moveX);
            this.containerEl.style.translate = '0px 0px';
            if (moveX > 75) {
                this.data = this.nextMonth();
            } else if (moveX < -75) {
                this.data = this.prevMonth();
            }
        }, false);
    }

    get data(): Date {
        return new Date(this.year, this.month, this.day, 0, 0, 0, 0);
    }
    set data(date: Date) {
        const tzDate = this.toTimezoneDate(date);
        console.log('DATE', tzDate);
        this.year = tzDate.getFullYear();
        this.month = tzDate.getMonth();
        this.day = tzDate.getDate();
        if (this.callBack) {
            this.callBack(tzDate).then(data => {
                this.activeDates = data.map(this.toTimezoneDate);
                this.renderCalendar();
            });
        } else {
            this.renderCalendar();
        }
    }

    get activeDates() {
        return this._activeDates;
    }
    set activeDates(list: Date[]) {
        this._activeDates = list.map(this.toTimezoneDate);
        this.renderCalendar();
    }

    private renderCalendar(): void {
        this.removeAllEventListeners();
        this.bodyEl.innerHTML = '';

        const firstDay = new Date(this.year, this.month, 1).getDay();
        const lastDate = new Date(this.year, this.month + 1, 0).getDate();

        this.monthEl.textContent = `${this.months[this.month]} ${this.year}`;

        let overflow = (firstDay + lastDate) - 35;
        let last = lastDate - overflow;

        const today = this.toTimezoneDate(new Date());
        today.setHours(0, 0, 0, 0);

        this.renderPreviousMonthDays(firstDay, last, lastDate, overflow, today);
        overflow = overflow > 0 ? overflow : 0;
        this.renderCurrentMonthDays(lastDate, overflow, today);

        if (firstDay + lastDate < 29) {
            this.renderGhostDay();
        }
    }

    private renderPreviousMonthDays(firstDay: number, last: number, lastDate: number, overflow: number, today: Date): void {
        for (let i = firstDay; i > 0; i--) {
            const date = document.createElement('div');
            date.classList.add('cell');
            if (overflow > 0) {
                last += 1;
                if (last <= lastDate) {
                    const currentDate = this.toTimezoneDate(new Date(this.year, this.month, last));
                    const isToday = currentDate.toDateString() === today.toDateString();
                    const isActive = this.activeDates.find(item => item.toDateString() === currentDate.toDateString());
                    if (isToday) date.classList.add('cellToday');
                    if (currentDate > today) date.classList.add('disabled');
                    if (isActive) date.classList.add('callActive');
                    this.addEventListener('click', () => {
                        this.dispatchCustomEvent('onDateClick', currentDate);
                    }, date);
                    date.innerText = `${last}`;
                } else {
                    date.classList.add('cellGhost');
                }
            } else {
                date.classList.add('cellGhost');
            }
            this.bodyEl.appendChild(date);
        }
    }

    private renderCurrentMonthDays(lastDate: number, overflow: number, today: Date): void {
        for (let i = 1; i <= (lastDate - overflow); i++) {
            const currentDate = this.toTimezoneDate(new Date(this.year, this.month, i));
            const isToday = currentDate.toDateString() === today.toDateString();
            const date = document.createElement('div');
            date.classList.add('cell');
            const isActive = this.activeDates.find(item => item.toDateString() === currentDate.toDateString());
            if (isToday) date.classList.add('cellToday');
            if (currentDate > today) date.classList.add('disabled');
            if (isActive) date.classList.add('callActive');
            this.addEventListener('click', () => {
                this.dispatchCustomEvent('onDateClick', currentDate);
            }, date);
            date.innerText = `${i}`.padStart(2, '0');
            this.bodyEl.appendChild(date);
        }
    }

    private renderGhostDay(): void {
        const date = document.createElement('div');
        date.classList.add('cell');
        date.classList.add('cellGhost');
        date.innerText = '0';
        this.bodyEl.appendChild(date);
    }

    private prevMonth(): Date {
        let year: number = this.year,
            month: number = this.month,
            day: number = this.day;

        if (this.month === 0) {
            month = 11;
            year -= 1;
        } else {
            month -= 1;
        }
        return new Date(year, month, day);
    }

    private nextMonth(): Date {
        let year: number = this.year,
            month: number = this.month,
            day: number = this.day;

        if (this.month === 11) {
            month = 0;
            year += 1;
        } else {
            month += 1;
        }
        return new Date(year, month, day);
    }

    protected getElement<T extends HTMLElement>(selector: string, parent: Document | HTMLElement = this.component): T {
        const element = parent.querySelector(selector) as T;
        if (!element) {
            throw new Error(`Element with selector ${selector} not found.`);
        }
        return element;
    }

    protected dispatchCustomEvent(eventName: string, data?: any) {
        const event = new CustomEvent(eventName, { detail: { page: this.component, data } });
        this.component.dispatchEvent(event);
        if (!this.customEvents.has(eventName)) {
            this.customEvents.add(eventName);
        }
    }

    public listen<T>(eventName: string, callback: (data?: T) => void): void {
        this.addEventListener(eventName, (event) => {
            // @ts-ignore
            const data: T = event.detail.data;
            callback(data);
        }, this.component, false);
    }
    public addEventListener(eventName: string, listener: EventListenerOrEventListenerObject, target: EventTarget = this.component, toClear: boolean = true, options?: boolean | AddEventListenerOptions) {
        target.addEventListener(eventName, listener, options);
        if (toClear) this.eventListeners.push({ eventName, target, listener, options });
    }

    public removeEventListener(eventName: string, listener: EventListenerOrEventListenerObject, target: EventTarget = this.component, options?: boolean | AddEventListenerOptions) {
        target.removeEventListener(eventName, listener, options);
        this.eventListeners = this.eventListeners.filter(
            ev => ev.eventName !== eventName || ev.listener !== listener || ev.options !== options || ev.target !== target
        );
    }

    protected removeAllEventListeners() {
        for (const { eventName, target, listener, options } of this.eventListeners) {
            if (!this.customEvents.has(eventName)) {
                this.removeEventListener(eventName, listener, target, options);
            }
        }
    }

    private clampMoveX(moveX: number): number {
        const min = -100;
        const max = 100;
        return Math.max(min, Math.min(max, moveX));
    }

    private toTimezoneDate(date: Date): Date {
        const options: Intl.DateTimeFormatOptions = {
            timeZone: this.timezone,
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        };
        const formatter = new Intl.DateTimeFormat('en-US', options);
        const parts = formatter.formatToParts(date);
        const getPart = (type: string) => Number(parts.find(p => p.type === type)?.value);
        return new Date(Date.UTC(getPart('year'), getPart('month') - 1, getPart('day'), getPart('hour'), getPart('minute'), getPart('second')));
    }
}