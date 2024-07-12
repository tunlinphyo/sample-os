import { Popup } from "../popup";
import { YearPicker } from "./year.picker";

export interface DatePickerData {
    year: number;
    month: number;
    day: number;
}


export class DatePicker extends Popup {
    private date: DatePickerData = {
        year: 2000,
        month: 0,
        day: 1
    };
    private yearMonth: YearPicker;

    constructor() {
        super({ btnStart: 'today', btnEnd: true }, 'datePickerTemplate');
        this.mainArea = this.getElement('#calendarDays');
        this.yearMonth = new YearPicker();
        this.init();
    }

    private init() {
        this.addNavigationListeners();
        this.addTodayButtonListener();
        this.addCalendarMonthListener();
    }

    private addNavigationListeners() {
        this.addEventListener('click', () => {
            this.update(this.changeMonth(this.date, -1));
        }, this.getElement('#prevButton'), false);

        this.addEventListener('click', () => {
            this.update(this.changeMonth(this.date, 1));
        }, this.getElement('#nextButton'), false);
    }

    private addTodayButtonListener() {
        this.addEventListener('click', () => {
            const today = this.getToday();
            this.date = today;
            this.update(today);
        }, this.btnStart, false);
    }

    private addCalendarMonthListener() {
        this.addEventListener('click', async () => {
            const result = await this.yearMonth.openPage('Year, Month', this.date);
            if (result && typeof result !== 'boolean') {
                this.update(result);
            }
        }, this.getElement('#calendarMonth'), false);
    }

    render(data: DatePickerData) {
        this.data = data;
        this.date = data;
        this.renderCalendar(data.year, data.month);
    }

    update(data: DatePickerData) {
        this.date = data;
        this.renderCalendar(data.year, data.month);
    }

    private renderCalendar(year: number, month: number) {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        this.updateCalendarHeader(year, months[month]);
        this.mainArea.innerHTML = '';

        const today = new Date();

        this.renderPreviousMonthDays(year, month, firstDay, lastDate, today);
        this.renderCurrentMonthDays(year, month, lastDate, firstDay, today);
        this.renderFillerCells(firstDay, lastDate);
    }

    private updateCalendarHeader(year: number, month: string) {
        this.getElement('#calendarMonth').textContent = month;
        this.getElement('#calendarYear').textContent = `${year}`;
    }

    private renderPreviousMonthDays(year: number, month: number, firstDay: number, lastDate: number, today: Date) {
        let overflow = (firstDay + lastDate) - 35;
        let last = lastDate - overflow;

        for (let i = firstDay; i > 0; i--) {
            const date = document.createElement('div');
            date.classList.add('cell');

            if (overflow > 0 && last <= lastDate) {
                last += 1;
                this.setDateCell(date, year, month, last, today, overflow-- > 0);
            } else {
                date.classList.add('cellGoast');
            }
            this.mainArea.appendChild(date);
        }
    }

    private renderCurrentMonthDays(year: number, month: number, lastDate: number, firstDay: number, today: Date) {
        for (let i = 1; i <= lastDate - Math.max(0, firstDay + lastDate - 35); i++) {
            const date = document.createElement('div');
            date.classList.add('cell');
            this.setDateCell(date, year, month, i, today);
            this.mainArea.appendChild(date);
        }
    }

    private setDateCell(date: HTMLElement, year: number, month: number, day: number, today: Date, isPreviousMonth: boolean = false) {
        if (!isPreviousMonth) {
            if (this.data.year == year && this.data.month == month && this.data.day == day) {
                date.classList.add('selected');
            }
            if (today.getDate() === day && today.getMonth() === month && today.getFullYear() === year) {
                date.classList.add('cellToday');
            }
        }

        this.addEventListener('click', () => this.selectDate(year, month, day, date), date);
        date.innerText = `${day}`.padStart(2, '0');
    }

    private renderFillerCells(firstDay: number, lastDate: number) {
        if (firstDay + lastDate < 29) {
            const date = document.createElement('div');
            date.classList.add('cell', 'cellGoast');
            date.innerText = '0';
            this.mainArea.appendChild(date);
        }
    }

    private selectDate(year: number, month: number, day: number, elem: HTMLElement) {
        this.date = { year, month, day };
        this.data = this.date;
        this.getAllElement('.cell', this.mainArea).forEach(cell => cell.classList.remove('selected'));
        elem.classList.add('selected');
    }

    private changeMonth(date: DatePickerData, delta: number): DatePickerData {
        let { month, year } = date;
        month += delta;

        if (month < 0) {
            month = 11;
            year -= 1;
        } else if (month > 11) {
            month = 0;
            year += 1;
        }

        return { year, month, day: date.day };
    }

    private getToday(): DatePickerData {
        const today = new Date();
        return {
            year: today.getFullYear(),
            month: today.getMonth(),
            day: today.getDate()
        };
    }
}
