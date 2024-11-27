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

type NotificationKey =
    | "phone"
    | "message"
    | "alarm"
    | "stopwatch"
    | "timer"
    | "settings"
    | "weather"
    | "music";

export class NotificationController extends BaseController {
    private notifications: Record<string, NotiType> = {};
    private clockElement: HTMLElement;
    private readonly appHierarchy: NotificationKey[] = [
        "phone",
        "message",
        "alarm",
        "stopwatch",
        "timer",
        "settings",
        "weather",
        "music",
    ];

    constructor(
        private history: HistoryStateManager,
        private notiStore: NotificationStore,
        private device: DeviceController,
        private phone: PhoneController,
        private clock: ClockController,
        private weather: WeatherController,
        private settingsController: SettingsController,
        private musicController: MusicController
    ) {
        super();
        this.clockElement = this.getElement("#dateTime");
        this.updateClock = this.updateClock.bind(this);
        this.setupListeners();
    }

    private setupListeners() {
        this.updateClock();

        // Listen to notification store changes
        this.notiStore.listen((list, item, operation) => {
            this.initializeNotifications(list);
            if (item) {
                this.handleNotiStoreChange(item, operation);
            } else if (this.notifications["music"]) {
                this.notiStore.del("music");
            }
        });

        // Debounced listeners
        const clockDebounce = debounce(this.handleClockChange.bind(this), 100);
        const musicDebounce = debounce(this.handleMusicChange.bind(this), 100);
        const weatherDebounce = debounce(this.handleWeatherChange.bind(this), 100);

        // Clock controller listener
        this.clock.addChangeListener((status: string) => clockDebounce(status));

        // Music controller listener
        this.musicController.addChangeListener((status: string, data: string) => {
            if (status === "SONG_PLAY_STATUS") {
                musicDebounce(data);
            }
        });

        // Weather controller listener
        this.weather.addChangeListener((status: string, data: any) => {
            if (status === "WEATHER_NOTIFICATION") {
                weatherDebounce(data);
            }
        });

        // Device event listeners
        this.device.addEventListener("updateClock", this.updateClock);
        this.device.addEventListener("openAppFinished", this.handleAppOpened.bind(this));

        // Phone controller listener
        this.phone.addChangeListener(this.handlePhoneChange.bind(this));

        // Settings controller listener
        this.settingsController.addChangeListener(this.handleSettingsChange.bind(this));

        // Clock element click event
        this.clockElement.addEventListener("click", this.handleClockClick.bind(this));
    }

    private initializeNotifications(list: Noti[]) {
        this.notifications = {};
        for (const noti of list) {
            this.notifications[noti.id] = noti;
            if (noti.id === "message") {
                this.device.messageNoti(true);
            }
            if (noti.id === "phone") {
                this.device.phoneNoti(true);
            }
        }
        setTimeout(this.updateClock, 10);
    }

    private handleNotiStoreChange(item: Noti, operation: string) {
        const id = item.id as NotificationKey;
        if (operation === "delete") {
            if (id === "phone") {
                this.device.phoneNoti(false);
            }
            if (id === "message") {
                this.device.messageNoti(false);
            }
            delete this.notifications[id];
        } else {
            this.notifications[id] = item;
        }
    }

    private handleClockChange(status: string) {
        if (status === "UPDATE_CLOCK") {
            this.stopwatch = this.clock.stopwatchRunning;
            this.updateClock();
        }
        if (status === "TIMER_UPDATE") {
            this.timer = !(this.clock.timerRunning && this.clock.remaining && !this.device.isTimer);
            this.updateClock();
        }
    }

    private handleMusicChange(status: string) {
        this.music = status === "playing";
    }

    private handleWeatherChange(data: any) {
        this.climate = data;
    }

    private handleAppOpened() {
        if (this.device.appOpened === "phone") {
            this.call = false;
            this.message = false;
        }
    }

    private handlePhoneChange(status: string, data: any) {
        if ((status === "PHONE_NOTI" || status === "MESSAGE_NOTI") && this.device.appOpened !== "phone") {
            if (status === "PHONE_NOTI") {
                this.device.phoneNoti(true);
                this.call = data;
            } else {
                this.device.messageNoti(true);
                this.message = data;
            }
        }
    }

    private handleSettingsChange(status: string, data: any) {
        if (status === "UPDATE_SYSTEM") {
            this.settings = data.isUpdate ? data.version : null;
        }
    }

    private handleClockClick() {
        const currentNoti = this.noti;
        if (this.device.appOpened && currentNoti) {
            const notiApp = this.notifications[currentNoti]?.app;
            if (this.device.appOpened === notiApp) {
                return;
            }
            this.history.replaceState("/", null);
            const listener = () => {
                setTimeout(() => {
                    this.openNotification(currentNoti);
                }, 0);
                this.device.removeEventListener("closeAppFinished", listener);
            };
            this.device.addEventListener("closeAppFinished", listener);
        } else {
            this.openNotification(currentNoti);
        }
    }

    private getElement<T extends HTMLElement>(
        selector: string,
        parent: Document | HTMLElement = document.body
    ): T {
        return parent.querySelector(selector) as T;
    }

    private openNotification(key?: string) {
        if (!key) return;
        const noti = this.notifications[key];
        if (!["settings", "music"].includes(key)) this.notiStore.del(key);
        if (noti) {
            this.device.setHistory(noti.app, [...noti.history]);
            this.history.replaceState(`/${noti.app}`, noti.data);
        }
    }

    private updateClock() {
        if (this.clock.remaining && this.clock.timerRunning && !this.device.isTimer) {
            this.updateCountDown(this.clock.remaining);
        } else {
            const hourString = OSDate.getCustomTime(new Date(), this.device.hour12, this.device.timeZone);
            this.clockElement.innerHTML = `${hourString} ${this.getIcon(this.noti)}`;
        }
    }

    private updateCountDown(remainingTime: number) {
        const result = this.convertMilliseconds(remainingTime);
        const time = result.hours
            ? `${this.pad(result.hours)}:${this.pad(result.minutes)}:${this.pad(result.seconds)}`
            : `${this.pad(result.minutes)}:${this.pad(result.seconds)}`;
        this.clockElement.innerHTML = `
            <span class="material-symbols-outlined fill-icon" style="font-size: 20px; translate: 0 -1px; margin-right: 2px;">timer_pause</span>
            ${time}
        `;
    }

    private getIcon(noti?: string) {
        switch (noti) {
            case "stopwatch":
                return '<span class="material-symbols-outlined fill-icon" style="font-size: 20px; margin-left: 2px; translate: 0 -2px;">timer</span>';
            case "phone":
                return '<span class="material-symbols-outlined fill-icon" style="font-size: 20px; margin-left: 2px; translate: 0 -2px;">phone_missed</span>';
            case "message":
                return '<span class="material-symbols-outlined fill-icon" style="font-size: 18px; margin-left: 2px;">chat_bubble</span>';
            case "settings":
                return '<span class="material-symbols-outlined fill-icon" style="font-size: 20px; margin-left: 2px; translate: 0 -1px;">settings</span>';
            case "weather":
                const weatherData = this.climate?.data;
                if (weatherData) {
                    const icon = WeatherService.getIcon(weatherData.weather[0].icon);
                    return `<span class="material-symbols-outlined fill-icon" style="font-size: 20px; margin-left: 2px; translate: 0 -1px;">${icon}</span>`;
                }
                return "";
            case "music":
                return '<span class="material-symbols-outlined fill-icon" style="font-size: 20px; margin-left: 2px;">music_note</span>';
            default:
                return "";
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
        return num.toString().padStart(2, "0");
    }

    // Getters and setters for notifications
    get noti(): string | undefined {
        for (const key of this.appHierarchy) {
            if (this.notifications[key]) {
                return key;
            }
        }
        return undefined;
    }

    get stopwatch(): NotiType | undefined {
        return this.notifications["stopwatch"];
    }
    set stopwatch(isRunning: boolean) {
        this.updateNotification("stopwatch", isRunning, {
            app: "clock",
            history: [{ state: null, url: "/stopwatch" }],
            data: null,
        });
    }

    get timer(): NotiType | undefined {
        return this.notifications["timer"];
    }
    set timer(isRunning: boolean) {
        this.updateNotification("timer", isRunning, {
            app: "clock",
            history: [{ state: null, url: "/timer" }],
            data: null,
        });
    }

    get call(): NotiType | undefined {
        return this.notifications["phone"];
    }
    set call(number: string | boolean) {
        if (typeof number === "string") {
            this.addNotification("phone", {
                app: "phone",
                history: [{ state: number, url: "/history" }],
                data: null,
            });
        } else {
            this.removeNotification("phone");
        }
    }

    get message(): NotiType | undefined {
        return this.notifications["message"];
    }
    set message(number: string | boolean) {
        if (typeof number === "string") {
            this.addNotification("message", {
                app: "phone",
                history: [{ state: number, url: "/history" }],
                data: null,
            });
        } else {
            this.removeNotification("message");
        }
    }

    get settings(): NotiType | undefined {
        return this.notifications["settings"];
    }
    set settings(version: number | null) {
        if (version) {
            this.addNotification("settings", {
                app: "settings",
                history: [
                    { state: "system", url: "/system" },
                    {
                        state: { id: "software-update", title: "Software Update", version },
                        url: "/system/update",
                    },
                ],
                data: null,
            });
        } else {
            this.removeNotification("settings");
        }
    }

    get climate(): NotiType | undefined {
        return this.notifications["weather"];
    }
    set climate(weather: any) {
        if (weather) {
            this.addNotification("weather", {
                app: "weather",
                history: [],
                data: weather,
            });
        } else {
            this.removeNotification("weather");
        }
    }

    get music(): NotiType | undefined {
        return this.notifications["music"];
    }
    set music(isPlaying: boolean) {
        this.updateNotification("music", isPlaying, {
            app: "music",
            history: [{ state: null, url: "/player" }],
            data: null,
        });
    }

    // Helper methods to manage notifications
    private addNotification(key: NotificationKey, data: NotiType) {
        this.notiStore.addNoti(key, data);
    }

    private removeNotification(key: NotificationKey) {
        this.notiStore.del(key);
    }

    private updateNotification(key: NotificationKey, condition: boolean, data: NotiType) {
        if (condition) {
            this.addNotification(key, data);
        } else {
            this.removeNotification(key);
        }
    }
}