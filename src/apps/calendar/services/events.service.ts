import { BaseController } from "../../../controllers/base.controller";
import { DeviceController } from "../../../device/device";
import { CalendarEvent } from "../../../stores/event.store";
import { OSDate } from "../../../utils/date";
import { OSNumber } from "../../../utils/number";

export type EventsCallback = (date: Date) => CalendarEvent[];
export type SetDateCallback = (date: Date) => void;

export class EventsService extends BaseController {
    private _date: Date = new Date();
    private hourMap: Record<string, number> = {
        '12 AM': 0,
        '1 AM': 1,
        '2 AM': 2,
        '3 AM': 3,
        '4 AM': 4,
        '5 AM': 5,
        '6 AM': 6,
        '7 AM': 7,
        '8 AM': 8,
        '9 AM': 9,
        '10 AM': 10,
        '11 AM': 11,
        'Noon': 12,
        '1 PM': 13,
        '2 PM': 14,
        '3 PM': 15,
        '4 PM': 16,
        '5 PM': 17,
        '6 PM': 18,
        '7 PM': 19,
        '8 PM': 20,
        '9 PM': 21,
        '10 PM': 22,
        '11 PM': 23,
    }

    private prevDateEl: HTMLElement | undefined;
    private currDateEl: HTMLElement | undefined;
    private nextDateEl: HTMLElement | undefined;
    private dateButton: HTMLElement | undefined;

    private startX: number = 0;
    private currentX: number = 0;
    private startY: number = 0;
    private currentY: number = 0;
    private moveX: number = 0;
    private moveY: number = 0;
    private direction: "x" | "y" | "0" = "0";

    public animating: boolean = false;
    private scrollY: number = 0;

    constructor(
        private device: DeviceController,
        private component: HTMLElement,
        private callback: EventsCallback,
        private setDate: SetDateCallback,
    ) {
        super();
    }

    get date() {
        return this._date;
    }
    set date(date: Date) {
        const newDate = new Date(date);
        newDate.setHours(0, 0, 0, 0);

        const diff = this.daysBetween(this._date, newDate);

        if (diff < 0) {
            if (diff == -1) this.renderPrev();
            else this.renderPrevDate(date);
        }
        if (diff > 0) {
            if (diff == 1) this.renderNext();
            else this.renderNextDate(date);
        }
        this._date = newDate;
        this.setDate(newDate);
        if (this.dateButton) {
            this.dateButton.textContent = OSDate.formatDate(this._date, this.device.timeZone, true, true);
        }
    }

    get hours() {
        return [
            '12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5AM', '6 AM', '7AM', '8 AM', '9 AM', '10 AM', '11 AM',
            'Noon',
            '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM', '12 AM', 
        ];
    }

    init(date: Date) {
        this.date = date;
        this.animating = false;
        this.renderAction();
        this.renderEvents(this.date);
        this.touchEventListeners();
        this.scrollTo();
    }

    moving(x: number, y: number) {
        if (this.animating) return;

        if (this.direction == "0") {
            if (Math.abs(x) >= Math.abs(y)) {
                this.direction = "x";
            } else {
                this.direction = "y";
            }
        }

        if (Math.abs(y) > Math.abs(x) || this.direction === "y") {
            return;
        };

        if (this.currDateEl) {
            this.currDateEl.style.transition = "none";
            this.currDateEl.style.translate = `${x}px 0`;
        }
        if (this.nextDateEl) {
            this.nextDateEl.style.transition = "none";
            this.nextDateEl.style.translate = `calc(100% + ${x}px) 0`;
        }
        if (this.prevDateEl) {
            this.prevDateEl.style.transition = "none";
            this.prevDateEl.style.translate = `calc(-100% + ${x}px) 0`;
        }

    }

    moveEnd(x: number, y: number) {
        if (this.animating) return;

        if (Math.abs(y) > Math.abs(x) || this.direction === "y") {
            return this.reset();
        };

        let move: boolean = false;
        this.direction = "0";
        if (x > 80) {
            this.date = this.getPrevDate(this.date);
            move = true;
        } else if (x < -80) {
            this.date = this.getNextDate(this.date);
            move = true;
        }
        if (this.currDateEl) {
            this.currDateEl.style.transition = "translate .7s ease"
            if (!move) this.currDateEl.style.translate = `0 0`;
        }
        if (this.nextDateEl) {
            this.nextDateEl.style.transition = "translate .7s ease";
            if (!move) this.nextDateEl.style.translate = `100% 0`;
        }
        if (this.prevDateEl) {
            this.prevDateEl.style.transition = "translate .7s ease";
            if (!move) this.prevDateEl.style.translate = `-100% 0`;
        }
    }

    update() {
        if (this.currDateEl) {
            this.updateEventList(this.currDateEl, this.date, this.callback(this.date));
        }
        if (this.prevDateEl) {
            const prevDate = this.getPrevDate(this.date);
            this.updateEventList(this.prevDateEl, prevDate, this.callback(prevDate));
        }
        if (this.nextDateEl) {
            const nextDate = this.getNextDate(this.date);
            this.updateEventList(this.nextDateEl, nextDate, this.callback(nextDate));
        }
    }

    private scrollTo() {
        setTimeout(() => {
            const y = this.getTop(new Date());
            if (this.currDateEl) this.currDateEl.scrollTo(0, (y - 140));
        }, 0);
    }

    private reset() {
        this.direction = "0";
        if (this.currDateEl) {
            this.currDateEl.style.transition = "translate .7s ease"
            this.currDateEl.style.translate = `0 0`;
        }
        if (this.nextDateEl) {
            this.nextDateEl.style.transition = "translate .7s ease";
            this.nextDateEl.style.translate = `100% 0`;
        }
        if (this.prevDateEl) {
            this.prevDateEl.style.transition = "translate .7s ease";
            this.prevDateEl.style.translate = `-100% 0`;
        }
    }

    private renderPrev() {
        if (!(this.currDateEl && this.prevDateEl && this.nextDateEl)) return;
        this.animating = true;

        this.currDateEl.style.translate = '100% 0';
        this.prevDateEl.style.translate = '0 0';

        const transitionEndHandler = async () => {
            this.currDateEl!.removeEventListener('transitionend', transitionEndHandler);

            this.nextDateEl?.remove();
            this.nextDateEl = this.currDateEl;
            this.currDateEl = this.prevDateEl;

            const prevDate = this.getPrevDate(this.date);
            this.prevDateEl = this.createEvents(prevDate, this.callback(prevDate), "prev");
            this.animating = false;
        };
        this.currDateEl.addEventListener('transitionend', transitionEndHandler);
    }

    private renderNext() {
        if (!(this.currDateEl && this.prevDateEl && this.nextDateEl)) return;
        this.animating = true;

        this.currDateEl.style.translate = '-100% 0';
        this.nextDateEl.style.translate = '0 0';

        const transitionEndHandler = async () => {
            this.currDateEl!.removeEventListener('transitionend', transitionEndHandler);

            this.prevDateEl?.remove();
            this.prevDateEl = this.currDateEl;
            this.currDateEl = this.nextDateEl;

            const nextDate = this.getNextDate(this.date);
            this.nextDateEl = this.createEvents(nextDate, this.callback(nextDate), "next");
            this.animating = false;
        };
        this.currDateEl.addEventListener('transitionend', transitionEndHandler);
    }

    private renderPrevDate(date: Date) {
        if (!(this.currDateEl && this.prevDateEl && this.nextDateEl)) return;
        this.animating = true;

        this.updateEventList(this.prevDateEl, date, this.callback(date));
        this.currDateEl!.style.translate = '100% 0';
        this.prevDateEl!.style.translate = '0 0';

        const transitionEndHandler = async () => {
            this.currDateEl!.removeEventListener('transitionend', transitionEndHandler);

            this.nextDateEl?.remove();
            const nextDate = this.getNextDate(date);
            this.nextDateEl = this.createEvents(nextDate, this.callback(nextDate), "next");
            this.currDateEl?.remove();
            this.currDateEl = this.prevDateEl;

            const prevDate = this.getPrevDate(date);
            this.prevDateEl = this.createEvents(prevDate, this.callback(prevDate), "prev");
            this.animating = false;
            this.scrollTo();
        };
        this.currDateEl!.addEventListener('transitionend', transitionEndHandler);
    }

    private renderNextDate(date: Date) {
        if (!(this.currDateEl && this.prevDateEl && this.nextDateEl)) return;
        this.animating = true;

        this.updateEventList(this.nextDateEl, date, this.callback(date));
        this.currDateEl!.style.translate = '-100% 0';
        this.nextDateEl!.style.translate = '0 0';

        const transitionEndHandler = async () => {
            this.currDateEl!.removeEventListener('transitionend', transitionEndHandler);

            this.prevDateEl?.remove();
            const prevDate = this.getPrevDate(date);
            this.prevDateEl = this.createEvents(prevDate, this.callback(prevDate), "prev");
            this.currDateEl?.remove();
            this.currDateEl = this.nextDateEl;

            const nextDate = this.getNextDate(date);
            this.nextDateEl = this.createEvents(nextDate, this.callback(nextDate), "next");
            this.animating = false;
            this.scrollTo();
        };
        this.currDateEl!.addEventListener('transitionend', transitionEndHandler);
    }

    private renderEvents(date: Date) {
        this.currDateEl?.remove();
        this.prevDateEl?.remove();
        this.nextDateEl?.remove();

        const prevDate = this.getPrevDate(date);
        const nextDate = this.getNextDate(date);

        this.prevDateEl = this.createEvents(prevDate, this.callback(prevDate), "prev");
        this.currDateEl = this.createEvents(date, this.callback(date), "curr");
        this.nextDateEl = this.createEvents(nextDate, this.callback(nextDate), "next");
    }

    private createEvents(date: Date, events: CalendarEvent[], type: "curr" | "prev" | "next") {
        const scrollArea = this.createElement('div', ['scrollArea', type]);
        scrollArea.id = OSDate.getUniqueIdFromDate(date);

        const dayArea = this.createElement('div', ['dayArea']);

        const eventList = this.createElement('div', ['eventList']);
        // this.renderNoEvent(eventList, 'No Event');
        
        dayArea.appendChild(eventList);
        scrollArea.appendChild(dayArea);

        this.renderHourList(scrollArea, dayArea, date);
        this.updateEventList(scrollArea, date, events);
        this.component.appendChild(scrollArea);

        scrollArea.addEventListener('scroll', (event) => {
            if (this.animating || scrollArea.id != this.currDateEl?.id) {
                event.preventDefault();
                return;
            }
            this.scrollY = scrollArea.scrollTop;
            if (this.currDateEl && this.currDateEl.id != scrollArea.id) {
                this.currDateEl.scrollTo(0, this.scrollY);
                // this.currDateEl.scrollTop = this.scrollY;
            }
            if (this.prevDateEl && this.prevDateEl.id != scrollArea.id) {
                this.prevDateEl.scrollTo(0, this.scrollY);
                // this.prevDateEl.scrollTop = this.scrollY;
            }
            if (this.nextDateEl && this.nextDateEl.id != scrollArea.id) {
                this.nextDateEl.scrollTo(0, this.scrollY);
                // this.nextDateEl.scrollTop = this.scrollY;
            }
        })

        return scrollArea;
    }

    private renderHourList(elem: HTMLElement, container: HTMLElement, date: Date) {
        const hourList = this.createElement('div', ['hourList']);
        if (!hourList) return;

        for (const hour of this.hours) {
            const hourItem = this.createElement('div', ['hourItem']);
            hourItem.textContent = hour;

            hourItem.addEventListener('click', () => {
                if (OSNumber.isInRange(this.moveX, [-1, 1]) && OSNumber.isInRange(this.moveY, [-1, 1])) {
                    const eventDate = new Date(date);
                    eventDate.setHours(this.hourMap[hour]);
                    this.notifyListeners('NEW_EVENT', eventDate);
                }
            })

            hourList.appendChild(hourItem);
        }

        container.appendChild(hourList);

        setTimeout(() => {
            elem.scrollTo(0, this.scrollY);
        }, 0);
    }

    private updateEventList(elem: HTMLElement, date: Date, events: CalendarEvent[]) {
        elem.id = OSDate.getUniqueIdFromDate(date);
        this.renderNow(elem, date);
        const eventList = elem.querySelector(".eventList");
        if (!eventList) return;
        eventList.innerHTML = "";

        let prevEnd: Date | null = null;
        let move: boolean = false;
        let index: number = 0;

        for(const event of events) {
            const eventItem = this.createElement('div', ['eventItem']);
            const eventName = this.createElement('div', ['eventName']);
            eventName.textContent = event.title;
            eventItem.appendChild(eventName);

            if (event.allDay) {
                eventItem.style.top = `${index * 32}px`;
                // eventItem.style.left = 'calc(var(--half) + 120px)';
                eventItem.classList.add("oneLine");
                index += 1;
            } else {
                const diffMinutes = OSDate.getMinutesDifference(event.startTime, event.endTime);
                const isOverlap = prevEnd ? event.startTime.getTime() < prevEnd.getTime() : false;
                prevEnd = prevEnd 
                    ? (event.endTime.getTime() < prevEnd!.getTime() ? prevEnd : event.endTime)
                    : event.endTime;
                
                const top = this.getTop(event.startTime);
                const height = OSNumber.mapRange(diffMinutes, 0, 60, 0, 51);
                eventItem.style.top = `${top}px`;
                eventItem.style.minHeight = `${height}px`;
    
                if (height < 50) {
                    eventItem.classList.add("oneLine");
                }
    
                if (move) {
                    move = false;
                    if (isOverlap) eventItem.style.right = 'calc(var(--half) + 30px)';
                } else {
                    if (isOverlap) {
                        move = true;
                        eventItem.style.left = 'calc(var(--half) + 80px)';
                    }
                }
            }


            eventItem.addEventListener('click', () => {
                if (OSNumber.isInRange(this.moveX, [-1, 1]) && OSNumber.isInRange(this.moveY, [-1, 1])) {
                    this.notifyListeners('OPEN_EVENT', event.id);
                }
            })
            eventList.appendChild(eventItem);
        }
    }

    private renderAction() {
        const dateToggle = this.createElement('div', ['dateToggle', 'stickyTop']);
        const prevButton = this.createElement('button', ['prevButton']);
        prevButton.innerHTML = '<span class="material-symbols-outlined">arrow_back</span>';
        const currentDate = this.createElement('div', ['currentDate']);
        currentDate.textContent = OSDate.formatDate(this.date, this.device.timeZone, true, true);
        const nextButton = this.createElement('button', ['nextButton']);
        nextButton.innerHTML = '<span class="material-symbols-outlined">arrow_forward</span>';

        dateToggle.appendChild(currentDate);
        dateToggle.appendChild(prevButton);
        dateToggle.appendChild(nextButton);

        prevButton.addEventListener('click', () => {
            this.date = this.getPrevDate(this.date);
        });
        nextButton.addEventListener('click', () => {
            this.date = this.getNextDate(this.date);
        });

        this.dateButton = currentDate;
        this.component.appendChild(dateToggle);
    }

    private touchEventListeners() {
        this.component.addEventListener('touchstart', (event) => {
            this.startX = event.touches[0].clientX;
            this.startY = event.touches[0].clientY;
            this.currentX = event.touches[0].clientX;
            this.currentY = event.touches[0].clientY;
        }, false);

        this.component.addEventListener('touchmove', (event) => {
            this.currentX = event.touches[0].clientX;
            this.currentY = event.touches[0].clientY;
            const moveX = this.currentX - this.startX;
            const moveY = this.currentY - this.startY;
            this.moving(moveX, moveY);
        }, false);

        this.component.addEventListener('touchend', () => {
            const moveX = this.currentX - this.startX;
            const moveY = this.currentY - this.startY;
            this.moveX = moveX;
            this.moveY = moveY;
            this.moveEnd(moveX, moveY);
        }, false);

        this.component.addEventListener('mousedown', (event) => {
            this.startX = event.clientX;
            this.startY = event.clientY;
            this.currentX = event.clientX;
            this.currentY = event.clientY;

            const onMouseMove = (moveEvent: MouseEvent) => {
                this.currentX = moveEvent.clientX;
                this.currentY = moveEvent.clientY;
                const moveX = this.currentX - this.startX;
                const moveY = this.currentY - this.startY;
                this.moving(moveX, moveY);
            };

            const onMouseUp = () => {
                const moveX = this.currentX - this.startX;
                const moveY = this.currentY - this.startY;
                this.moveX = moveX;
                this.moveY = moveY;
                this.moveEnd(moveX, moveY);
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }, false);
    }

    private getPrevDate(date: Date) {
        const prevDate = new Date(date);
        prevDate.setDate(date.getDate() - 1);
        return prevDate;
    }
    private getNextDate(date: Date) {
        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);
        return nextDate;
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

    private renderNow(elem: HTMLElement, date: Date) {
        if (!this.isToday(date)) return;
        const dayArea = elem.querySelector('.dayArea');
        if (!dayArea) return;
        const nowEl = this.createElement('div', ['nowLine']);
        
        const top = this.getTop(new Date());
        nowEl.style.top = `${top}px`;

        dayArea.appendChild(nowEl);
    }

    // private renderNoEvent(parentEl: HTMLElement, message: string) {
    //     const msgEl = this.createElement('div', ['noEvent']);
    //     msgEl.textContent = message;
    //     parentEl.appendChild(msgEl);
    // }

    // private isOver(event: CalendarEvent, eventDate: Date) {
    //     const today = new OSDate(new Date());
    //     if (today.isOlderThan(eventDate)) {
    //         return true;
    //     } else if (today.isSameDay(eventDate)) {
    //         const now = today.getHourMinutes();
    //         const end = new OSDate(event.endTime).getHourMinutes();

    //         return end <= now;
    //     } else {
    //         return false;
    //     }
    // }

    private daysBetween(date1: Date, date2: Date): number {
        const diffInTime = date2.getTime() - date1.getTime();
        const diffInDays = diffInTime / (1000 * 3600 * 24);
        return diffInDays;
    }

    private isToday(date: Date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today.toDateString() === date.toDateString()
    }

    private getTop(date: Date) {
        const minutes = OSDate.getHMinM(new Date(date)) + 30;
        const parentH = 1224;
        const minutesMax = 24 * 60;

        return OSNumber.mapRange(minutes, 0, minutesMax, 0, parentH);
    }
}