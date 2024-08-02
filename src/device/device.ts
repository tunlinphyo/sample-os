import { HistoryState, HistoryStateManager } from "./history.manager";
import { BaseComponent } from "../components/base";
import { AppAlert } from "../components/popups/alert.popup";
import { CallScreen } from "../components/system/call.screen";
import { DatePicker } from "../components/pickers/date.picker";
import { TimePicker } from "../components/pickers/time.picker";
import { ChoosePicker } from "../components/pickers/choose.picker";
import { KeyboardPage } from "../components/keyboard";
import { YearPicker } from "../components/pickers/year.picker";
import { OSDate } from "../utils/date";
import { TimeWheel } from "../components/pickers/time.wheel";
import { IncomingCall } from "../components/system/incoming.call";
import { OutgoingCall } from "../components/system/outgoing.call";
// import { OSBrowser } from "../utils/browser";
import { SelectPopup } from "../components/popups/select.popup";
import { SystemService } from "../services/system.service";
import { OSBrowser } from "../utils/browser";

export type DeviceTheme = 'auto' | 'light' | 'dark';

export class DeviceController extends BaseComponent {
    public deviceEl: HTMLElement;
    public appContainer: HTMLElement;
    public appFrame: HTMLIFrameElement;
    public homeFrame: HTMLIFrameElement;
    public systemFrame: HTMLIFrameElement;
    public navEl: HTMLButtonElement;

    private _theme: DeviceTheme = 'auto';
    private _timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
    private _hour12: boolean = true;
    private _appOpen: string | null = null;
    private _animating: boolean = false;

    private _appHistory: Record<string, HistoryState[]> = {};

    public lockedDevice: boolean = true;
    public system: SystemService;

    public outgoingCall: OutgoingCall;
    public incomingCall: IncomingCall;
    public callScreen: CallScreen;

    public keyboard: KeyboardPage;
    public alertPopup: AppAlert;
    public confirmPopup: AppAlert;
    public selectList: SelectPopup;
    public datePicker: DatePicker;
    public timePicker: TimePicker;
    public timeWheel: TimeWheel;
    public yearPicker: YearPicker;
    public choosePicker: ChoosePicker;

    constructor(
        private history: HistoryStateManager
    ) {
        super('deviceTemplate', document.body);
        this.history.onStateChange(this.onStateChange.bind(this));

        this.deviceEl = this.getElement("#device");
        this.appContainer = this.getElement('.appContainer');
        this.appFrame = this.getElement<HTMLIFrameElement>('#appFrame');
        this.homeFrame = this.getElement<HTMLIFrameElement>('#homeFrame');
        this.systemFrame = this.getElement<HTMLIFrameElement>('#systemFrame');
        this.navEl = this.getElement('.navigationBar-btn');

        this.outgoingCall = new OutgoingCall(this);
        this.incomingCall = new IncomingCall(this);
        this.callScreen = new CallScreen(this);

        this.keyboard = new KeyboardPage(this.appFrame);
        this.alertPopup = new AppAlert(this.appFrame);
        this.confirmPopup = new AppAlert(this.appFrame, true);
        this.selectList = new SelectPopup(this.appFrame);
        this.datePicker = new DatePicker(this.appFrame, this.timeZone);
        this.timePicker = new TimePicker(this.appFrame, this);
        this.timeWheel = new TimeWheel(this.appFrame);
        this.yearPicker = new YearPicker(this.appFrame);
        this.choosePicker = new ChoosePicker(this.appFrame);

        this.system = new SystemService();

        this.init();
    }

    get theme() {
        return this._theme;
    }
    set theme(theme: DeviceTheme) {
        this._theme = theme;
        this.setTheme(theme);
    }

    get timeZone() {
        return this._timeZone;
    }
    set timeZone(timeZone: string) {
        this._timeZone = timeZone;
        this.dispatchCustomEvent('updateClock');
        // this.updateClock(false, false);
    }

    get hour12() {
        return this._hour12;
    }
    set hour12(hour12: boolean) {
        this._hour12 = hour12;
        this.dispatchCustomEvent('updateClock');
        // this.updateClock(false, false);
    }

    get appOpened() {
        return this._appOpen;
    }
    get animating() {
        return this._animating;
    }

    // public
    public getHistory(app: string) {
        return this._appHistory[app];
    }

    public setHistory(key: string, history: HistoryState[]) {
        this._appHistory[key] = history;
    }

    public updateClock(timer: boolean, stopwatch: boolean) {
        const clockElement = this.getElement('#dateTime');

        if (!timer) {
            const hourString = OSDate.getCustomTime(new Date(), this.hour12, this.timeZone);
            if (stopwatch) {
                clockElement.innerHTML = `
                    ${hourString}
                    <span class="material-symbols-outlined fill-icon" style="font-size: 20px; margin-left: 2px">pace</span>
                `;
            } else {
                clockElement.textContent = hourString;
            }
        }
    }

    public resetDevice() {
        this.closeApp();
        this._appHistory = {};
    }

    public micNoti(on: boolean) {
        const noti = this.getElement("#notiLight");
        if (on) {
            noti.classList.add('yellowOn');
        } else {
            noti.classList.remove('yellowOn');
        }
    }

    public phoneNoti(on: boolean) {
        const noti = this.getElement("#notiLight");
        if (on) {
            noti.classList.add('greenGlow');
        } else {
            noti.classList.remove('greenGlow');
        }
    }

    public messageNoti(on: boolean) {
        const noti = this.getElement("#notiLight");
        if (on) {
            noti.classList.add('purpleGlow');
        } else {
            noti.classList.remove('purpleGlow');
        }
    }

    private init() {
        setTimeout(() => {
            const path = window.location.pathname;
            this.history.pushState(path, null);
        }, 1000);

        this.navEl.addEventListener('click', () => {
            if (!this.appOpened) return;
            if (!OSBrowser.isTouchSupport()) {
                this.history.replaceState('/', null);
            } else {
                this.navEl.animate([
                    { transform: 'translateY(0)' },
                    { transform: 'translateY(-4px)', offset: 0.3 },
                    { transform: 'translateY(0)', offset: 0.6 },
                    { transform: 'translateY(-2px)', offset: 0.8 },
                    { transform: 'translateY(0)' }
                ], {
                    duration: 1000,
                    easing: 'ease-in-out',
                    iterations: 1
                });
            }
        });
    }

    private onStateChange(_: any, url: string) {
        if (url == '/') {
            this.closeApp();
        } else {
            const pathes = url.split('/');
            this.openApp(`/src/apps/${pathes[1]}/index.html`, pathes[1]);
        }
    }

    private openApp(src: string, app: string) {
        this._appOpen = app;
        this._animating = true;
        this.appFrame.src = src;

        this.appContainer.classList.remove('hide');

        this.appContainer.style.transition = 'all .5s ease';
        this.appContainer.style.translate = '0 0';
        this.appContainer.style.scale = '1';

        this.homeFrame.style.transition = 'scale .5s ease';
        this.homeFrame.style.scale = '.7';


        this.dispatchCustomEvent('openApp');
        const transitionEndHandler = () => {
            this._animating = false;
            this.navEl.style.opacity = '1';
            this.setTheme(this.theme);
            this.dispatchCustomEvent('openAppFinished');
            this.appContainer.removeEventListener('transitionend', transitionEndHandler);
        };
        this.appContainer.addEventListener('transitionend', transitionEndHandler);
    }

    private closeApp() {
        if (!this._appOpen) return;
        this._appOpen = null;
        this._animating = true;
        this.appContainer.classList.add('hide');

        this.appContainer.style.transition = 'all .5s ease';
        this.appContainer.style.translate = '0 100%';
        this.appContainer.style.scale = '.5';

        this.homeFrame.style.transition = 'scale .5s ease';
        this.homeFrame.style.scale = '1';

        this.navEl.style.opacity = '0';

        this.dispatchCustomEvent('closeApp');

        const transitionEndHandler = () => {
            this._animating = false;
            this.dispatchCustomEvent('closeAppFinished');
            if (this.appContainer.classList.contains('hide')) {
                this.appFrame.src = '';
            }
            this.appContainer.removeEventListener('transitionend', transitionEndHandler);
        };
        this.appContainer.addEventListener('transitionend', transitionEndHandler);
    }

    private setTheme(theme: DeviceTheme) {
        if (theme === 'auto') {
            this.setThemeToAll('');
        } else {
            this.setThemeToAll(theme);
        }
    }

    private setThemeToAll(theme: string) {
        document.body.dataset.schema = theme;
        this.appFrame = this.getElement<HTMLIFrameElement>('#appFrame');

        if (this.homeFrame.contentDocument) {
            this.homeFrame.contentDocument.body.dataset.schema = theme;
        }
        if (this.appFrame.contentDocument && this.appFrame.contentDocument.body) {
            this.appFrame.contentDocument.body.dataset.schema = theme;
        }
        if (this.systemFrame.contentDocument && this.systemFrame.contentDocument.body) {
            this.systemFrame.contentDocument.body.dataset.schema = theme;
        }
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

    private convertMilliseconds(totalMilliseconds: number) {
        const totalSeconds = Math.round(totalMilliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return { hours, minutes, seconds };
    }

    public pad(num: number): string {
        return num.toString().padStart(2, '0');
    }
}