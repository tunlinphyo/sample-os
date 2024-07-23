import { BaseController } from "../../../controllers/base.controller";
import { DeviceController } from "../../../device/device";
import { CalendarEvent } from "../../../stores/event.store";
import { OSDate } from "../../../utils/date";
import { OSNumber } from "../../../utils/number";

export type EventsCallback = (date: Date) => CalendarEvent[];
export type SetDateCallback = (date: Date) => void;
export interface HourMap {
    hour12: string;
    hour24: string;
}

export class EventsService extends BaseController {
    private _date: Date = new Date();
    private hoursMap: Record<number, HourMap> = {
        0: {
            hour12: '12 AM',
            hour24: '00:00'
        },
        1: {
            hour12: '1 AM',
            hour24: '01:00'
        },
        2: {
            hour12: '2 AM',
            hour24: '02:00'
        },
        3: {
            hour12: '3 AM',
            hour24: '03:00'
        },
        4: {
            hour12: '4 AM',
            hour24: '04:00'
        },
        5: {
            hour12: '5 AM',
            hour24: '05:00'
        },
        6: {
            hour12: '6 AM',
            hour24: '06:00'
        },
        7: {
            hour12: '7 AM',
            hour24: '07:00'
        },
        8: {
            hour12: '8 AM',
            hour24: '08:00'
        },
        9: {
            hour12: '9 AM',
            hour24: '09:00'
        },
        10: {
            hour12: '10 AM',
            hour24: '10:00'
        },
        11: {
            hour12: '11 AM',
            hour24: '11:00'
        },
        12: {
            hour12: 'Noon',
            hour24: '12:00'
        },
        13: {
            hour12: '1 PM',
            hour24: '13:00'
        },
        14: {
            hour12: '2 PM',
            hour24: '14:00'
        },
        15: {
            hour12: '3 PM',
            hour24: '15:00'
        },
        16: {
            hour12: '4 PM',
            hour24: '16:00'
        },
        17: {
            hour12: '5 PM',
            hour24: '17:00'
        },
        18: {
            hour12: '6 PM',
            hour24: '18:00'
        },
        19: {
            hour12: '7 PM',
            hour24: '19:00'
        },
        20: {
            hour12: '8 PM',
            hour24: '20:00'
        },
        21: {
            hour12: '9 PM',
            hour24: '21:00'
        },
        22: {
            hour12: '10 PM',
            hour24: '22:00'
        },
        23: {
            hour12: '11 PM',
            hour24: '23:00'
        },
        24: {
            hour12: '12 AM',
            hour24: '00:00'
        },
    }

    private prevDateEl: HTMLElement | undefined;
    private currDateEl: HTMLElement | undefined;
    private nextDateEl: HTMLElement | undefined;
    private dateButton: HTMLElement | undefined;
    private statusEl: HTMLElement;

    private startX: number = 0;
    private currentX: number = 0;
    private startY: number = 0;
    private currentY: number = 0;
    private moveX: number = 0;
    private moveY: number = 0;
    private direction: "x" | "y" | "0" = "0";

    public animating: boolean = false;
    private scrollY: number = 0;
    private toSchool: boolean = false;

    constructor(
        private device: DeviceController,
        private component: HTMLElement,
        private callback: EventsCallback,
        private setDate: SetDateCallback,
    ) {
        super();

        this.statusEl = this.component.parentElement!.querySelector(".statusBar-title")!;
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
            this.dateButton.textContent = OSDate.formatDate(this._date, this.device.timeZone, false, true);
            this.statusEl.textContent = OSDate.customFormat(this._date, { year: 'numeric' }, this.device.timeZone);
        }
    }

    get hours() {
        return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
    }

    init(date: Date) {
        this.date = date;
        this.animating = false;
        this.renderAction();
        this.renderEvents(this.date);
        this.touchEventListeners();
        if (this.isToday(date)) {
            this.toSchool = true;
            this.scrollTo();
        } else {
            this.toSchool = false;
        }
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

    private scrollTo(isSmooth?: boolean) {
        setTimeout(() => {
            const y = this.getTop(new OSDate().getDateByTimeZone(this.device.timeZone));
            if (this.currDateEl) this.currDateEl.scrollTo({
                top: y - 140,
                behavior: isSmooth ? 'smooth' : 'instant'
            });
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
            if (this.isToday(this.date)) this.scrollTo(true);
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
            if (this.isToday(this.date)) this.scrollTo(true);
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
            if (this.isToday(date)) this.scrollTo();
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
            if (this.isToday(date)) this.scrollTo();
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
            this.toSchool = true;
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
            hourItem.textContent = this.getHourString(hour, this.device.hour12);

            hourItem.addEventListener('click', () => {
                if (OSNumber.isInRange(this.moveX, [-1, 1]) && OSNumber.isInRange(this.moveY, [-1, 1])) {
                    const eventDate = new Date(date);
                    eventDate.setHours(hour);
                    this.notifyListeners('NEW_EVENT', eventDate);
                }
            })

            hourList.appendChild(hourItem);
        }

        container.appendChild(hourList);

        setTimeout(() => {
            // if (this.isToday(this.date))
            if (this.toSchool) elem.scrollTo(0, this.scrollY);
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

        for (const event of events) {
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

                const top = this.getTop(new OSDate(event.startTime).getDateByTimeZone(this.device.timeZone));
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
        currentDate.textContent = OSDate.formatDate(this.date, this.device.timeZone, false, true);
        const nextButton = this.createElement('button', ['nextButton']);
        nextButton.innerHTML = '<span class="material-symbols-outlined">arrow_forward</span>';

        console.log(this.statusEl, "ELELEL");
        this.statusEl.textContent = OSDate.customFormat(this.date, { year: 'numeric' }, this.device.timeZone);

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
            if (Math.abs(moveY) <= Math.abs(moveX)) event.preventDefault();
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

        const top = this.getTop(new OSDate().getDateByTimeZone(this.device.timeZone));
        nowEl.style.top = `${top}px`;

        dayArea.appendChild(nowEl);
    }

    private getHourString(hour: number, hour12: boolean) {
        if (hour12) return this.hoursMap[hour].hour12;
        return this.hoursMap[hour].hour24;
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
        const today = new OSDate().getDateByTimeZone(this.device.timeZone);
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