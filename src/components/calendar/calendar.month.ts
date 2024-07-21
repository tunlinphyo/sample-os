import { OSDate } from "../../utils/date";
import { OSNumber } from "../../utils/number";


export class CalendarMonth {
    private days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    public component: HTMLElement;

    constructor(
        private year: number,
        private month: number,
        private type: "curr" | "prev" | "next" = "curr",
        private activeDates: Date[],
        private callback: (date: Date) => void,
        private isPicker: boolean,
        private timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
    ) {
        this.component = this.createElement("div", ["caleandarContainer", this.type]);
        this.init();
    }

    set position(type: "curr" | "prev" | "next") {
        this.type = type;
        this.component.className = `caleandarContainer ${type}`;
    }

    translate(num: number) {
        num = OSNumber.inRange(num, [-340, 340]);
        let translate = '0 0';
        if (this.type === 'curr') {
            translate = `${num}px 0`;
        } else if (this.type === 'prev') {
            translate = `calc(-100% + ${num}px) 0`;
        } else if (this.type === 'next') {
            translate = `calc(100% + ${num}px) 0`;
        }
        this.component.style.transition = "none";
        this.component.style.translate = translate;
    }

    animate(back: boolean = true) {
        let translate = '0 0';
        if (this.type === 'prev') {
            translate = `-100% 0`;
        } else if (this.type === 'next') {
            translate = `100% 0`;
        }
        this.component.style.transition = "translate .7s ease";
        if (back) {
            this.component.style.translate = translate;
        }
    }

    prev() {
        if (this.type === "curr") {
            this.component.style.translate = '100% 0';
        } else if (this.type === 'prev') {
            this.component.style.translate = '0 0';
        }
    }

    next() {
        if (this.type === "curr") {
            this.component.style.translate = '-100% 0';
        } else if (this.type === 'next') {
            this.component.style.translate = '0 0';
        }
    }

    remove() {
        this.component.remove();
    }

    addEventListener(transitionEndHandler: EventListenerOrEventListenerObject) {
        this.component.addEventListener('transitionend', transitionEndHandler);
    }

    removeEventListener(transitionEndHandler: EventListenerOrEventListenerObject) {
        this.component.removeEventListener('transitionend', transitionEndHandler);
    }

    updateBody(date: {year: number, month: number}, activeDates: Date[]) {
        this.activeDates = activeDates;
        const bodyEl = this.component.querySelector(".jsCalendarBody");

        if (bodyEl) {
            bodyEl.remove();
            this.year = date.year;
            this.month = date.month;
            this.createBody();
        }
    }

    private init() {
        this.createHeaders();
        this.createBody();
    }

    private createHeaders() {
        const headerEl = this.createElement("div", ["calendar", "title"]);
        for(const day of this.days) {
            const dayEl = this.createElement("div", ["cell", "cellTitle"]);
            dayEl.textContent = day;
            headerEl.appendChild(dayEl);
        }

        this.component.appendChild(headerEl);
    }

    private createBody() {
        const bodyEl = this.createElement('div', ['calendar', 'jsCalendarBody']);

        const firstDay = new Date(this.year, this.month, 1).getDay();
        const lastDate = new Date(this.year, this.month + 1, 0).getDate();

        let overflow = (firstDay + lastDate) - 35;
        let last = lastDate - overflow;

        const today = this.toTimezoneDate(new Date());
        today.setHours(0, 0, 0, 0);

        this.renderOverflow(bodyEl, firstDay, last, lastDate, overflow, today);
        overflow = overflow > 0 ? overflow : 0;
        this.renderMonthDays(bodyEl, lastDate, overflow, today);

        if (firstDay + lastDate < 29) {
            this.renderGhostDay(bodyEl);
        }

        this.component.appendChild(bodyEl);
    }

    private renderOverflow(bodyEl: HTMLElement, firstDay: number, last: number, lastDate: number, overflow: number, today: Date) {
        for (let i = firstDay; i > 0; i--) {
            const dateEl = this.createElement('div', ['cell']);
            if (overflow > 0) {
                last += 1;
                if (last <= lastDate) {
                    const currentDate = new Date(this.year, this.month, last);
                    const isToday = this.isToday(currentDate, today);
                    const isActive = this.isActive(currentDate);
                    if (isToday) dateEl.classList.add('cellToday');
                    if (currentDate > today) dateEl.classList.add('disabled');
                    if (isActive) dateEl.classList.add(this.isPicker ? 'selected' : 'callActive');
                    dateEl.textContent = this.padStart(last);
                    dateEl.addEventListener("click", () => {
                        this.callback(new Date(this.year, this.month, last));
                    });
                } else {
                    dateEl.classList.add('cellGhost');
                }
            } else {
                dateEl.classList.add('cellGhost');
            }

            bodyEl.appendChild(dateEl);
        }
    }

    private renderMonthDays(bodyEl: HTMLElement, lastDate: number, overflow: number, today: Date) {
        for (let i = 1; i <= (lastDate - overflow); i++) {
            const dateEl = this.createElement('div', ['cell']);
            const currentDate = new Date(this.year, this.month, i);
            const isToday = this.isToday(currentDate, today);
            const isActive = this.isActive(currentDate);
            if (isToday) dateEl.classList.add('cellToday');
            if (currentDate > today) dateEl.classList.add('disabled');
            if (isActive) dateEl.classList.add(this.isPicker ? 'selected' : 'callActive');
            dateEl.textContent = this.padStart(i);
            dateEl.addEventListener("click", () => {
                this.callback(new Date(this.year, this.month, i));
            });

            bodyEl.appendChild(dateEl);
        }
    }

    private renderGhostDay(bodyEl: HTMLElement) {
        const dateEl = this.createElement('div', ['cell', 'cellGhost']);
        dateEl.textContent = '0';
        bodyEl.appendChild(dateEl);
    }

    private isToday(date: Date, today: Date) {
        return today.toDateString() === date.toDateString()
    }

    private isActive(date: Date) {
        return !!this.activeDates.find(item => item.toDateString() === date.toDateString());
    }

    private createElement<T extends HTMLElement>(elementName: string, classes: string[] = [], attributes: { [key: string]: string } = {}): T {
        const element = document.createElement(elementName) as T;

        if (classes.length > 0) {
            element.classList.add(...classes);
        }

        for (const key in attributes) {
            if (attributes.hasOwnProperty(key)) {
                element.setAttribute(key, attributes[key]);
            }
        }

        return element;
    }

    private toTimezoneDate(date: Date): Date {
        return new OSDate(date).getDateByTimeZone(this.timeZone);
    }

    private padStart(num: number) {
        return `${num}`.padStart(2, '0')
    }
}