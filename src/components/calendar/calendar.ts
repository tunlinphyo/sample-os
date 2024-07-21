import { BaseController } from "../../controllers/base.controller";
import { CalendarMonth } from "./calendar.month";

export type ActiveDatesCallback = (date: Date) => Promise<Date[]>;

export interface YearMonth {
    year: number;
    month: number;
}

export class CalendarService extends BaseController {
    private months: string[] = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    private _year: number = 0;
    private _month: number = 0;

    private prevMonthEl: CalendarMonth | undefined;
    private currMonthEl: CalendarMonth | undefined;
    private nextMonthEl: CalendarMonth | undefined;

    public animating: boolean = false;

    constructor(
        private component: HTMLElement,
        private dateElem: HTMLElement,
        private callback: ActiveDatesCallback,
        private isPicker: boolean = false
    ) {
        super();
    }

    get date(): YearMonth {
        return { year: this._year, month: this._month };
    }
    set date(date: YearMonth) {
        const comparison = this.compareYearMonth(this.date, date);

        if (comparison > 0) {
            if (comparison == 1) this.renderPrev(date);
            else this.renderPrevDate(date);
        }
        if (comparison < 0) {
            if (comparison == -1) this.renderNext(date);
            else this.renderNextDate(date);
        }

        this._year = date.year;
        this._month = date.month;

        this.dateElem.textContent = `${date.year} ${this.months[date.month]}`;
    }

    get dateObject() {
        return new Date(this.date.year, this.date.month, 1);
    }
    get prevDateObject() {
        return new Date(this.prevDate.year, this.prevDate.month, 1);
    }
    get nextDateObject() {
        return new Date(this.nextDate.year, this.nextDate.month, 1);
    }


    get prevDate(): YearMonth {
        let year = this._year, month = this._month;
        if (this._month === 0) {
            month = 11;
            year -= 1;
        } else {
            month -= 1;
        }
        return { year, month };
    }
    get nextDate(): YearMonth {
        let year = this._year, month = this._month;
        if (this._month === 11) {
            month = 0;
            year += 1;
        } else {
            month += 1;
        }
        return { year, month };
    }

    set toDate(date: Date) {
        this.date = { year: date.getFullYear(), month: date.getMonth() };
    }

    prev() {
        setTimeout(() => {
            if (this.animating) return;
            this.date = this.prevDate;
        }, 0);
    }

    next() {
        setTimeout(() => {
            if (this.animating) return;
            this.date = this.nextDate;
        }, 0);
    }

    init(date: Date) {
        this.date = { year: date.getFullYear(), month: date.getMonth() };
        console.log("INIT", this.date, date);
        this.renderCalendar(this.date);
    }

    moving(num: number) {
        if (this.animating) return;
        if (this.currMonthEl) {
            this.currMonthEl.translate(num);
        }
        if (this.nextMonthEl) {
            this.nextMonthEl.translate(num);
        }
        if (this.prevMonthEl) {
            this.prevMonthEl.translate(num);
        }
    }

    moveEnd(num: number) {
        if (this.animating) return;
        
        if (num > 80) {
            this.currMonthEl?.animate(false);
            this.nextMonthEl?.animate(false);
            this.prevMonthEl?.animate(false);
            this.date = this.prevDate;
            this.notifyListeners('DATE_CHANGE', this.dateObject);
        } else if (num < -80) {
            this.currMonthEl?.animate(false);
            this.nextMonthEl?.animate(false);
            this.prevMonthEl?.animate(false);
            this.date = this.nextDate;  
            this.notifyListeners('DATE_CHANGE', this.dateObject);  
        } else {
            this.currMonthEl?.animate();
            this.nextMonthEl?.animate();
            this.prevMonthEl?.animate();
        }

    }

    async updatedData() {
        this.currMonthEl?.updateBody(this.date, await this.callback(this.getDateObject(this.date)));
        this.prevMonthEl?.updateBody(this.prevDate, await this.callback(this.getDateObject(this.prevDate)));
        this.nextMonthEl?.updateBody(this.nextDate, await this.callback(this.getDateObject(this.nextDate)));
    }

    isSameDate(date: Date) {
        return this._year == date.getFullYear() && this._month == date.getMonth();
    }

    private renderPrev(date: YearMonth) {
        if (!(this.currMonthEl && this.prevMonthEl && this.prevMonthEl)) return;
        this.animating = true;

        this.currMonthEl.prev();
        this.prevMonthEl.prev();

        const transitionEndHandler = async () => {
            this.currMonthEl!.removeEventListener(transitionEndHandler);
            this.nextMonthEl?.remove();
            this.currMonthEl!.position = "next";
            this.nextMonthEl = this.currMonthEl;
            this.prevMonthEl!.position = "curr";
            this.currMonthEl = this.prevMonthEl;

            this.prevMonthEl = await this.createMonth(this.getPrevDate(date), "prev");
            this.animating = false;
        };
        this.currMonthEl.addEventListener(transitionEndHandler);
    }

    private renderNext(date: YearMonth) {
        if (!(this.currMonthEl && this.nextMonthEl && this.prevMonthEl)) return;
        this.animating = true;

        this.currMonthEl.next();
        this.nextMonthEl.next();

        const transitionEndHandler = async () => {
            this.currMonthEl!.removeEventListener(transitionEndHandler);
            this.prevMonthEl?.remove();
            this.currMonthEl!.position = "prev";
            this.prevMonthEl = this.currMonthEl;
            this.nextMonthEl!.position = "curr";
            this.currMonthEl = this.nextMonthEl;

            this.nextMonthEl = await this.createMonth(this.getNextDate(date), "next");
            this.animating = false;
        };
        this.currMonthEl.addEventListener(transitionEndHandler);
    }

    private async renderPrevDate(date: YearMonth) {
        if (!(this.currMonthEl && this.nextMonthEl && this.prevMonthEl)) return;
        this.animating = true;
        
        this.currMonthEl.prev();
        this.prevMonthEl.prev();
        const dates = await this.callback(new Date(date.year, date.month, 1));
        this.prevMonthEl.updateBody(date, dates);

        const transitionEndHandler = async () => {
            this.currMonthEl!.removeEventListener(transitionEndHandler);
            this.nextMonthEl?.remove();
            this.currMonthEl!.position = "next";
            this.nextMonthEl = this.currMonthEl;
            this.prevMonthEl!.position = "curr";
            this.currMonthEl = this.prevMonthEl;

            const nextDate = this.getNextDate(date);
            const dates = await this.callback(new Date(nextDate.year, nextDate.month, 1));
            this.nextMonthEl!.updateBody(nextDate, dates);
            this.prevMonthEl = await this.createMonth(this.getPrevDate(date), "prev");
            this.animating = false;
        };
        this.currMonthEl.addEventListener(transitionEndHandler);
    }

    private async renderNextDate(date: YearMonth) {
        if (!(this.currMonthEl && this.nextMonthEl && this.prevMonthEl)) return;
        this.animating = true;
        
        this.currMonthEl.next();
        this.nextMonthEl.next();
        const dates = await this.callback(new Date(date.year, date.month, 1));
        this.nextMonthEl.updateBody(date, dates);

        const transitionEndHandler = async () => {
            this.currMonthEl!.removeEventListener(transitionEndHandler);
            this.prevMonthEl?.remove();
            this.currMonthEl!.position = "prev";
            this.prevMonthEl = this.currMonthEl;
            this.nextMonthEl!.position = "curr";
            this.currMonthEl = this.nextMonthEl;
            
            const prevDate = this.getPrevDate(date);
            const dates = await this.callback(new Date(prevDate.year, prevDate.month, 1));
            this.prevMonthEl!.updateBody(prevDate, dates);
            this.nextMonthEl = await this.createMonth(this.getNextDate(date), "next");
            this.animating = false;
        };
        this.currMonthEl.addEventListener(transitionEndHandler);
    }

    private renderCalendar(date: YearMonth) {
        this.currMonthEl?.remove();
        this.prevMonthEl?.remove();
        this.nextMonthEl?.remove();

        setTimeout(async () => {
            this.currMonthEl = await this.createMonth(date, "curr");
            this.prevMonthEl = await this.createMonth(this.getPrevDate(date), "prev");
            this.nextMonthEl = await this.createMonth(this.getNextDate(date), "next");
        }, 0);
    }

    private async createMonth(date: YearMonth, type: "curr" | "prev" | "next") {
        const dates = await this.callback(new Date(date.year, date.month, 1));

        const calendar = new CalendarMonth(date.year, date.month, type, dates, (date) => {
            const year = date.getFullYear();
            const month = date.getMonth();

            console.log("ON_DATE", date, this._year === year && this._month === month);

            if (this._year === year && this._month === month) {
                this.notifyListeners('DATE', date);
            }
        }, this.isPicker);

        this.component.appendChild(calendar.component);
        return calendar;
    }

    private getDateObject(date: YearMonth) {
        return new Date(date.year, date.month, 1);
    }

    private getPrevDate(date: YearMonth): YearMonth {
        let year = date.year, month = date.month;
        if (this._month === 0) {
            month = 11;
            year -= 1;
        } else {
            month -= 1;
        }
        return { year, month };
    }

    private getNextDate(date: YearMonth): YearMonth {
        let year = date.year, month = date.month;
        if (this._month === 11) {
            month = 0;
            year += 1;
        } else {
            month += 1;
        }
        return { year, month };
    }

    private compareYearMonth(a: YearMonth, b: YearMonth): number {
        if (a.year === b.year) {
            return a.month - b.month;
        } else {
            const result = a.year - b.year;
            return result * 12;
        }
    }
}