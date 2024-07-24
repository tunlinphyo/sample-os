import { Popup } from "../popup";

export interface DatePickerData {
    year: number;
    month: number;
    day: number;
}

export class YearPicker extends Popup {
    private readonly monthes = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Set', 'Oct', 'Nov', 'Dec'];
    private years: number[] = [];
    private yearIndex: number = 0;
    private monthIndex: number = 0;

    constructor(iframeEl: HTMLIFrameElement) {
        super(iframeEl, { btnEnd: true }, 'timeWheelTemplate');
        const timeWheel = this.getElement('.timeWheel')!;
        timeWheel.classList.add('noLabel');

        this.mainArea = timeWheel;
        this.init();
    }

    init(diff: number = 50) {
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - diff;
        const endYear = currentYear + diff;
        this.years = [];
        for(let year = startYear; year <= endYear; year++) {
            this.years.push(year);
        }
    }

    render(data: DatePickerData) {
        return new Promise(() => {
            this.data = data;
            this.yearIndex = this.years.indexOf(data.year);
            this.monthIndex = data.month;

            this.mainArea.innerHTML = `<div class="yearMonthContainer"></div>`;

            const yearEl = this.createElement('div', ['yearContainer']);
            const SIZE = 40;
            this.years.forEach(year => {
                const number = this.createElement('div', ['number'], { 'data-year': year.toString() });
                number.textContent = year.toString();
                yearEl.appendChild(number);
            })
            this.addEventListener('scroll', () => {
                this.yearIndex = Math.floor(yearEl.scrollTop / SIZE);
                this.data = this.getData();
            }, yearEl);
            this.mainArea.appendChild(yearEl);
            yearEl.scrollTop = SIZE * (this.yearIndex + 1);

            const monthEl = this.createElement('div', ['monthContainer']);
            for (let i = 0; i < 12; i++) {
                const number = this.createElement('div', ['number'], { 'data-month': this.monthes[i] });
                number.textContent = this.monthes[i];
                monthEl.appendChild(number);
            }
            this.addEventListener('scroll', () => {
                this.monthIndex = Math.floor(monthEl.scrollTop / SIZE);
                this.data = this.getData();
            }, monthEl);
            this.mainArea.appendChild(monthEl);
            monthEl.scrollTop = SIZE * (this.monthIndex + 1);
        })
    }

    // update(data: DatePickerData) {
    //     return this.render(data);
    // }

    private getData() {
        return {
            year: this.years[this.yearIndex],
            month: this.monthIndex,
            day: 1,
        }
    }
}
