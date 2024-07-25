import { DeviceController } from "../device/device";
import { HistoryState, HistoryStateManager } from "../device/history.manager";
import { OSDate } from "../utils/date";
import { BaseController } from "./base.controller";
import { ClockController } from "./clock.controller";
import { PhoneController } from "./phone.controller";
import { WeatherController } from "./weather.controller";

export interface NotiType {
    app: string;
    history: HistoryState[];
    data?: any;
}

export class NotificationController extends BaseController {
    private notification: Record<string, NotiType> = {};
    private statusContainer: HTMLElement;

    constructor(
        private history: HistoryStateManager,
        private device: DeviceController,
        private phone: PhoneController,
        private clock: ClockController,
        private weather: WeatherController
    ) {
        super();
        this.statusContainer = this.getElement('.statusContainer')!;
        console.log(this.statusContainer);
        this.setupListeners();
    }

    get stopwatch(): NotiType | undefined {
        return this.notification.stopwatch;
    }
    set stopwatch(state: any) {
        this.notification.stopwatch = {
            app: 'clock',
            history: [{ state, url:"/stopwatch" }]
        }
    }

    private openNoti(key: string) {
        const noti = this.notification[key];
        if (noti) {
            this.device.setHistory(noti.app, noti.history);
            this.history.replaceState("", null);
        }
    }

    private openTimer() {
        this.device.setHistory('clock', [{"state":null,"url":"/timer"}]);
        this.history.replaceState('/clock', null);
    }

    private setupListeners() {
        this.clock.addChangeListener(async (status: string, data: any) => {
            if (status === 'UPDATE_CLOCK') {
                // UPDATE CLOCK
            }
            if (status === 'TIMER_UPDATE') {
                // UPDATE TIMER
            }
        });

        this.weather.addChangeListener((status: string, data: any) => {
            if (status === 'WEATHER_NOTIFIGATION') {
                console.log('WEATHER::::::::::', data);
            }
        });
    }

    public updateClock(timer: boolean, stopwatch: boolean) {
        const clockElement = this.getElement('#dateTime');

        if (!timer) {
            const hourString = OSDate.getCustomTime(new Date(), this.device.hour12, this.device.timeZone);
            if (stopwatch) {
                clockElement.innerHTML = `
                    ${hourString}}
                    <span class="material-symbols-outlined fill-icon" style="font-size: 20px; translate: 0 -2px; margin-left: 2px">timer</span>
                `;
            } else {
                clockElement.textContent = hourString;
            }
        }
    }

    private getElement<T extends HTMLElement>(selector: string, parent: Document | HTMLElement = document.body): T {
        const element = parent.querySelector(selector) as T;
        return element;
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
}