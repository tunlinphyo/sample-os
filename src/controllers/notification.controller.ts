import { DeviceController } from "../device/device";
import { HistoryState, HistoryStateManager } from "../device/history.manager";
import { OSDate } from "../utils/date";
import { BaseController } from "./base.controller";
import { ClockController, TimerData } from "./clock.controller";
import { PhoneController } from "./phone.controller";
import { WeatherController } from "./weather.controller";

export interface NotiType {
    app: string;
    history: HistoryState[];
    data: any;
}

export class NotificationController extends BaseController {
    private notification: Record<string, NotiType> = {};
    private statusContainer: HTMLElement;
    private clockElement: HTMLElement;

    private readonly appHierarchy: string[] = ['timer', 'phone', 'message', 'alarm', 'stopwatch'];

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
        this.clockElement = this.getElement('#dateTime');
        this.setupListeners();
    }

    get noti(): string | undefined {
        for(const key of this.appHierarchy) {
            if (this.notification[key]) {
                return key;
            }
        }
        return;
    }

    get stopwatch(): NotiType | undefined {
        return this.notification.stopwatch;
    }
    set stopwatch(isDelete: boolean) {
        if (isDelete) {
            delete this.notification.stopwatch
        } else {
            this.notification.stopwatch = {
                app: 'clock',
                history: [{ state: null, url:"/stopwatch" }],
                data: null
            }
        }
    }

    get timer(): NotiType | undefined {
        return this.notification.timer;
    }
    set timer(isDelete: boolean) {
        if (isDelete) {
            delete this.notification.timer;
        } else {
            this.notification.timer = {
                app: 'clock',
                history: [{ state: null, url:"/timer" }],
                data: null
            }
        }
    }

    private openNoti(key?: string) {
        if (!key) return;
        const noti = this.notification[key];
        if (noti) {
            console.log('NOTI', noti);
            this.device.setHistory(noti.app, noti.history);
            this.history.replaceState(`/${noti.app}`, noti.data);
        }
    }

    private setupListeners() {
        this.updateClock();

        this.clock.addChangeListener(async (status: string) => {
            if (status === 'UPDATE_CLOCK') {
                this.stopwatch = !this.clock.stopwatchRunning;
                this.updateClock();
            }
            if (status === 'TIMER_UPDATE') {
                this.timer = !(this.clock.timerRunning && this.clock.remaining);
                this.updateClock();
            }
        });

        this.clockElement.addEventListener('click', () => {
            if (this.device.appOpened && this.noti) {
                this.history.replaceState('/', null);

                const listener = () => {
                    setTimeout(() => {
                        this.openNoti(this.noti);
                    }, 0);
                    this.device.removeEventListener('closeAppFinished', listener);
                }

                this.device.addEventListener('closeAppFinished', listener);
            } else {
                this.openNoti(this.noti);
            }
        });

        this.device.addEventListener('updateClock', () => {
            this.updateClock();
        });

        this.phone.addChangeListener((status: string, data: any) => {
            console.log(status, data);
        })

        this.weather.addChangeListener((status: string, data: any) => {
            if (status === 'WEATHER_NOTIFIGATION') {
                console.log('WEATHER::::::::::', data);
            }
        });
    }

    public updateClock() {
        console.log(this.clock.timerRunning, this.clock.stopwatchRunning, this.clock.remaining, this.noti);

        if (this.clock.remaining && this.clock.timerRunning) {
            this.updateCountDown(this.clock.remaining, 'timer')
        } else {
            const hourString = OSDate.getFormatTime(new Date(), this.device.hour12, this.device.timeZone);
            this.clockElement.innerHTML = `${hourString} ${this.getIcon(this.noti)}`;
        }
    }

    private getElement<T extends HTMLElement>(selector: string, parent: Document | HTMLElement = document.body): T {
        const element = parent.querySelector(selector) as T;
        return element;
    }

    public updateCountDown(remainingTime: number, icon: string) {
        const clockElement = this.getElement('#dateTime');
        const result = this.convertMilliseconds(remainingTime);
        let time = "";
        if (result.hours) {
            time = `${this.pad(result.hours)}:${this.pad(result.minutes)}:${this.pad(result.seconds)}`;
        } else {
            time = `${this.pad(result.minutes)}:${this.pad(result.seconds)}`;
        }
        clockElement.innerHTML = `
            <span class="material-symbols-outlined fill-icon" style="font-size: 20px; translate: 0 -1px;">${icon}</span>
            ${time}
        `;
    }

    private getIcon(noti?: string) {
        switch (noti) {
            case 'stopwatch':
                return '<span class="material-symbols-outlined fill-icon" style="font-size: 20px; margin-left: 2px;">pace</span>'
            default:
                return '';
        }
    }

    private convertMilliseconds(totalMilliseconds: number) {
        const totalSeconds = Math.round(totalMilliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return { hours, minutes, seconds };
    }

    private pad(num: number): string {
        return num.toString().padStart(2, '0');
    }
}