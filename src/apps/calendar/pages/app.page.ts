import { App } from "../../../components/app";
import { CalendarService } from "../../../components/calendar/calendar";
import { CalendarController } from "../../../controllers/calendar.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { OSBrowser } from "../../../utils/browser";
import { OSDate } from "../../../utils/date";
import { OSNumber } from "../../../utils/number";


export class CalendarApp extends App {
    private calendarService: CalendarService;

    private dateMonthEl: HTMLElement;
    private prevButton: HTMLElement;
    private nextButton: HTMLElement;

    private startX: number = 0;
    private moveX: number = 0;
    private currentX: number = 0;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private calendar: CalendarController
    ) {
        super(history, { template: 'calendarTemplate', btnStart: 'today', btnEnd: 'add' });

        this.dateMonthEl = this.getElement('#dateMonth');
        this.prevButton = this.getElement(".prevButton");
        this.nextButton = this.getElement(".nextButton");
        this.calendarService = new CalendarService(
            this.getElement('#calendarUI'),
            this.dateMonthEl, async (date: Date) => {
                return this.calendar.getActives(date);
            },
            this.device.timeZone,
        );

        this.init();
        this.touchEventListeners();
    }

    private init() {
        this.render(this.calendar.eventDay);

        this.addEventListener("click", () => {
            this.calendarService.prev();
        }, this.prevButton, false);

        this.addEventListener("click", () => {
            this.calendarService.next();
        }, this.nextButton, false);

        if (OSBrowser.isTouchSupport()) {
            this.addEventListener('touchend', (event) => {
                event.preventDefault();
                this.calendar.eventDay = new Date();
            }, this.btnStart, false);

            this.addEventListener('touchend', (event) => {
                event.preventDefault();
                this.history.pushState('/events/new', null);
            }, this.btnEnd, false);
        } else {
            this.addEventListener('click', () => {
                this.calendarService.today();
            }, this.btnStart, false);

            this.addEventListener('click', () => {
                this.history.pushState('/events/new', null);
            }, this.btnEnd, false);
        }

        this.addEventListener('click', async () => {
            const result = await this.device.yearPicker.openPage('Year, Month', {
                year: this.calendarService.date.year,
                month: this.calendarService.date.month
            });
            if (result && typeof result !== 'boolean') {
                this.calendarService.date = result;
            }
        }, this.dateMonthEl, false);

        this.calendarService.addChangeListener((status: string, date: Date) => {
            if (status === 'DATE' && OSNumber.isInRange(this.moveX, [-1, 1])) {
                this.history.pushState('/events', date);
                this.calendar.eventDay = date;
            }
            if (status === 'DATE_CHANGE') {
                this.calendar.eventDay = date;
            }
        })

        const calendarListener = (status: string) => {
            switch (status) {
                case 'EVENTS_DATE_CHANGE':
                case 'EVENT_UPDATED':
                case 'EVENT_DELETED':
                    this.calendarService.toDate = this.calendar.eventDay;
                    break;
            }
        };

        this.calendar.addChangeListener(calendarListener);

        this.device.addEventListener('closeApp', () => {
            this.calendar.removeChangeListener(calendarListener);
        });
    }

    private touchEventListeners() {
        this.mainArea.addEventListener('touchstart', (event) => {
            this.startX = event.touches[0].clientX;
            // this.startY = event.touches[0].clientY;
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

    render(data?: Date) {
        if (!data) data = new OSDate().getDateByTimeZone(this.device.timeZone);
        this.calendarService.init(data);
    }

    update() {}
}
