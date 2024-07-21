import { OSNumber } from "../../utils/number";
import { CalendarService } from "../calendar/calendar";
import { Popup } from "../popup";
import { YearPicker } from "./year.picker";

export interface DatePickerData {
    year: number;
    month: number;
    day: number;
}


export class DatePicker extends Popup {
    private calendarService: CalendarService;
    private yearPicker: YearPicker;
    private dateMonthEl: HTMLElement;
    private prevButton: HTMLElement;
    private nextButton: HTMLElement;

    private startX: number = 0;
    private moveX: number = 0;
    private currentX: number = 0;

    constructor() {
        super({ btnStart: 'today', btnEnd: true }, 'datePickerTemplate');
        
        this.yearPicker = new YearPicker();
        this.dateMonthEl = this.getElement('#dateMonth');
        this.prevButton = this.getElement(".prevButton");
        this.nextButton = this.getElement(".nextButton");

        this.calendarService = new CalendarService(
            this.getElement('#calendarUI'), 
            this.dateMonthEl, 
            async () => [this.data],
            true
        );
        this.init();
    }

    private init() {
        this.eventsListeners();
        this.touchEventListeners();
    }

    private eventsListeners() {
        this.addEventListener("click", () => {
            this.calendarService.prev();
        }, this.prevButton, false);

        this.addEventListener("click", () => {
            this.calendarService.next();
        }, this.nextButton, false);

        this.addEventListener('click', () => {
            // this.data = new Date();
            this.calendarService.toDate = new Date();
        }, this.btnStart, false);

        this.addEventListener('click', async () => {
            const result = await this.yearPicker.openPage('Year, Month', { 
                year: this.calendarService.date.year, 
                month: this.calendarService.date.month 
            });
            if (result && typeof result !== 'boolean') {
                this.calendarService.date = result;
            }
        }, this.dateMonthEl, false);

        this.calendarService.addChangeListener((status: string, date: Date) => {
            if (status === 'DATE' && OSNumber.isInRange(this.moveX, [-1, 1])) {
                this.data = date;
                this.calendarService.updatedData();
            }
        });
    }

    private touchEventListeners() {
        this.mainArea.addEventListener('touchstart', (event) => {
            this.startX = event.touches[0].clientX;
            this.currentX = event.touches[0].clientX;
        }, false);

        this.mainArea.addEventListener('touchmove', (event) => {
            this.currentX = event.touches[0].clientX;
            const moveX = this.currentX - this.startX;
            this.calendarService.moving(moveX);
        }, false);

        this.mainArea.addEventListener('touchend', () => {
            const moveX = this.currentX - this.startX;
            this.moveX = moveX;
            this.calendarService.moveEnd(moveX);
        }, false);

        this.mainArea.addEventListener('mousedown', (event) => {
            this.startX = event.clientX;
            // this.startY = event.clientY;
            this.currentX = event.clientX;

            const onMouseMove = (moveEvent: MouseEvent) => {
                this.currentX = moveEvent.clientX;
                const moveX = this.currentX - this.startX;
                this.calendarService.moving(moveX);
            };

            const onMouseUp = () => {
                const moveX = this.currentX - this.startX;
                this.moveX = moveX;
                this.calendarService.moveEnd(moveX);
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }, false);
    }

    render(data: Date) {
        this.data = data;
        const date = new Date(data);
        this.calendarService.init(date);
    }

    update() {}
}
