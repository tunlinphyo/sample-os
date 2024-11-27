import { DeviceController } from "../device/device";
import { HistoryState, HistoryStateManager } from "../device/history.manager";
import { WeatherService } from "../services/weather.service";
import { Noti, NotificationStore } from "../stores/noti.store";
import { OSDate } from "../utils/date";
import { debounce } from "../utils/debounce";
import { BaseController } from "./base.controller";
import { ClockController } from "./clock.controller";
import { MusicController } from "./music.controller";
import { PhoneController } from "./phone.controller";
import { SettingsController } from "./settings.controller";
import { WeatherController } from "./weather.controller";

export interface NotiType {
    app: string;
    history: HistoryState[];
    data: any;
}

export class NotificationController extends BaseController {
    private notification: Record<string, NotiType> = {};
    // private statusContainer: HTMLElement;
    private clockElement: HTMLElement;

    private readonly appHierarchy: string[] = ['phone', 'message', 'alarm', 'stopwatch', 'timer', 'settings', 'weather', 'music'];

    constructor(
        private history: HistoryStateManager,
        private notiStore: NotificationStore,
        private device: DeviceController,
        private phone: PhoneController,
        private clock: ClockController,
        private weather: WeatherController,
        private setting: SettingsController,
        private musicController: MusicController,
    ) {
        super();
        // this.statusContainer = this.getElement('.statusContainer')!;
        this.clockElement = this.getElement('#dateTime');
        this.updateClock = this.updateClock.bind(this);
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
            this.notiStore.del('stopwatch');
        } else {
            const data = {
                app: 'clock',
                history: [{ state: null, url:"/stopwatch" }],
                data: null
            }
            this.notiStore.addNoti('stopwatch', data);
        }
    }

    get timer(): NotiType | undefined {
        return this.notification.timer;
    }
    set timer(isDelete: boolean) {
        if (isDelete) {
            this.notiStore.del('timer');
        } else {
            const data = {
                app: 'clock',
                history: [{ state: null, url:"/timer" }],
                data: null
            }
            this.notiStore.addNoti('timer', data);
        }
    }

    get call(): NotiType | undefined {
        return this.notification.phone;
    }
    set call(number: string | boolean) {
        if (typeof number === 'string') {
            const data = {
                app: 'phone',
                history: [{ state: number, url:"/history" }],
                data: null
            }
            this.notiStore.addNoti('phone', data);
        } else {
            this.notiStore.del('phone');
        }
    }

    get message(): NotiType | undefined {
        return this.notification.message;
    }
    set message(number: string | boolean) {
        if (typeof number === 'string') {
            const data = {
                app: 'phone',
                history: [{ state: number, url:"/history" }],
                data: null
            }
            this.notiStore.addNoti('message', data);
        } else {
            this.notiStore.del('message');
        }
    }

    get settings(): NotiType | undefined {
        return this.notification.settings;
    }
    set settings(version: number | null) {
        if (version) {
            const data = {
                app: 'settings',
                history: [{"state":"system","url":"/system"},{"state":{"id":"software-update","title":"Software Update","version":version},"url":"/system/update"}],
                data: null,
            }
            this.notiStore.addNoti('settings', data);
        } else {
            this.notiStore.del('settings');
        }
    }

    get climate(): NotiType | undefined {
        return this.notification.weather;
    }
    set climate(weather: any) {
        if (weather) {
            const data = {
                app: 'weather',
                history: [],
                data: weather,
            }
            this.notiStore.addNoti('weather', data);
        } else {
            this.notiStore.del('weather');
        }
    }

    get music(): NotiType | undefined {
        return this.notification.message;
    }
    set music(playing: boolean) {
        if (playing) {
            const data = {
                app: 'music',
                history: [{ state: null, url:"/player" }],
                data: null
            }
            this.notiStore.addNoti('music', data);
        } else {
            this.notiStore.del('music');
        }
    }

    private openNoti(key?: string) {
        if (!key) return;
        const noti = this.notification[key];
        if (!['settings', 'music'].includes(key)) this.notiStore.del(key);
        if (noti) {
            this.device.setHistory(noti.app, [...noti.history]);
            this.history.replaceState(`/${noti.app}`, noti.data);
        }
    }

    private initNotis(list: Noti[]) {
        for(const noti of list) {
            this.notification[noti.id] = noti;
            if (noti.id === 'message') {
                this.device.messageNoti(true);
            }
            if (noti.id === 'phone') {
                this.device.phoneNoti(true);
            }
        }
        setTimeout(this.updateClock, 10);
    }

    private setupListeners() {
        this.updateClock();

        this.notiStore.listen((list, item, operation) => {
            this.initNotis(list);
            if (item) {
                if (operation === 'delete') {
                    if (item.id === 'phone') {
                        this.device.phoneNoti(false);
                    }
                    if (item.id === 'message') {
                        this.device.messageNoti(false);
                    }
                    delete this.notification[item.id];
                } else {
                    this.notification[item.id] = item;
                }
            } else if (this.notification['music']) {
                this.notiStore.del('music');
            }
        });

        const clockDebounce = debounce((status: string) => {
            if (status === 'UPDATE_CLOCK') {
                this.stopwatch = !this.clock.stopwatchRunning;
                this.updateClock();
            }
            if (status === 'TIMER_UPDATE') {
                this.timer = !(this.clock.timerRunning && this.clock.remaining && !this.device.isTimer);
                this.updateClock();
            }
        }, 100);
        this.clock.addChangeListener(async (status: string) => {
            clockDebounce(status);
        });

        this.clockElement.addEventListener('click', () => {
            if (this.device.appOpened && this.noti) {
                if (this.device.appOpened == this.notification[this.noti].app) {
                    return;
                }
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

        const musicDebounce = debounce((status: string) => {
            this.music = status == 'playing' ? true : false;
        }, 100);
        this.musicController.addChangeListener((status: string, data: string) => {
            if (status == 'SONG_PLAY_STATUS') {
                musicDebounce(data);
            }
        })

        this.device.addEventListener('updateClock', () => {
            this.updateClock();
        });

        this.device.addEventListener('openAppFinished', () => {
            if (this.device.appOpened === 'phone') {
                this.call = false;
                this.message = false;
            }
        });

        // this.device.addEventListener('closeAppFinished', () => {
        //     console.log('APP_CLOSED', this.device.appOpened);
        // });

        this.phone.addChangeListener((status: string, data: any) => {
            if ((status === 'PHONE_NOTI' || status === 'MESSAGE_NOTI') && this.device.appOpened !== 'phone') {
                if (status === 'PHONE_NOTI') {
                    this.device.phoneNoti(true);
                    this.call = data;
                } else {
                    this.device.messageNoti(true);
                    this.message = data;
                }
            }
        });

        const weatherDebounce = debounce((data: any) => {
            this.climate = data;
        }, 100);
        this.weather.addChangeListener((status: string, data: any) => {
            if (status === 'WEATHER_NOTIFICATION') {
                console.log('WEATHER_NOTIFICATION', data);
                weatherDebounce(data);
            }
            // if (status === 'MY_WEATHER_FETCH') {
            //     this.climate = data;
            // }
        });

        this.setting.addChangeListener((status: string, data: any) => {
            if (status === 'UPDATE_SYSTEM') {
                this.settings = data.isUpdate ? data.version : null;
            }
        })
    }

    public updateClock() {
        // this.timer = !(this.clock.timerRunning && this.clock.remaining && !this.device.isTimer);
        if (this.clock.remaining && this.clock.timerRunning && !this.device.isTimer) {
            this.updateCountDown(this.clock.remaining)
        } else {
            const hourString = OSDate.getCustomTime(new Date(), this.device.hour12, this.device.timeZone);
            this.clockElement.innerHTML = `${hourString} ${this.getIcon(this.noti)}`;
        }
    }

    private getElement<T extends HTMLElement>(selector: string, parent: Document | HTMLElement = document.body): T {
        const element = parent.querySelector(selector) as T;
        return element;
    }

    public updateCountDown(remainingTime: number) {
        const clockElement = this.getElement('#dateTime');
        const result = this.convertMilliseconds(remainingTime);
        let time = "";
        if (result.hours) {
            time = `${this.pad(result.hours)}:${this.pad(result.minutes)}:${this.pad(result.seconds)}`;
        } else {
            time = `${this.pad(result.minutes)}:${this.pad(result.seconds)}`;
        }
        clockElement.innerHTML = `
            <span class="material-symbols-outlined fill-icon" style="font-size: 20px; translate: 0 -1px; margin-right: 2px;">timer_pause</span>
            ${time}
        `;
    }

    private getIcon(noti?: string) {
        switch (noti) {
            case 'stopwatch':
                return '<span class="material-symbols-outlined fill-icon" style="font-size: 20px; margin-left: 2px; translate: 0 -2px;">timer</span>';
            case 'phone':
                return '<span class="material-symbols-outlined fill-icon" style="font-size: 20px; margin-left: 2px; translate: 0 -2px;">phone_missed</span>';
            case 'message':
                return '<span class="material-symbols-outlined fill-icon" style="font-size: 18px; margin-left: 2px;">chat_bubble</span>';
            case 'settings':
                return '<span class="material-symbols-outlined fill-icon" style="font-size: 20px; margin-left: 2px; translate: 0 -1px;">settings</span>';
            case 'weather':
                const weather = this.climate?.data;
                if (weather) {
                    return `<span class="material-symbols-outlined fill-icon" style="font-size: 20px; margin-left: 2px; translate: 0 -1px;">${WeatherService.getIcon(weather.weather[0].icon)}</span>`;
                } else {
                    return '';
                }
            case 'music':
                return '<span class="material-symbols-outlined fill-icon" style="font-size: 20px; margin-left: 2px; translate: 0 0;">music_note</span>';
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