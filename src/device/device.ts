import { HistoryState, HistoryStateManager } from "./history.manager";
import { BaseComponent } from "../components/base";
import { AppAlert } from "../components/popups/alert.popup";
import { SelectList } from "../components/select";
import { CallScreen, IncomingCall } from "./call.screen";
import { DatePicker } from "../components/pickers/date.picker";
import { TimePicker } from "../components/pickers/time.picker";
import { ChooseList } from "../components/pickers/choose.picker";
import { KeyboardPage } from "../components/keyboard";
import { YearPicker } from "../components/pickers/year.picker";
import { OSDate } from "../utils/date";
import { TimeWheel } from "../components/pickers/time.wheel";

export type DeviceTheme = 'auto' | 'light' | 'dark';

export class DeviceController extends BaseComponent {
    public appContainer: HTMLElement;
    public appFrame: HTMLIFrameElement;
    public homeFrame: HTMLIFrameElement;

    private app: string = '';
    private _theme: DeviceTheme = 'auto';
    private _timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
    private _hour12: boolean = true;

    private _appHistory: Record<string, HistoryState[]> = {};

    public keyboard: KeyboardPage;
    public alertPopup: AppAlert;
    public confirmPopup: AppAlert;
    public selectList: SelectList;
    public incomingCall: IncomingCall;
    public callScreen: CallScreen;
    public datePicker: DatePicker;
    public timePicker: TimePicker;
    public timeWheel: TimeWheel;
    public yearPicker: YearPicker;
    public chooseList: ChooseList;

    constructor(
        private history: HistoryStateManager
    ) {
        super('deviceTemplate', document.body);
        this.history.onStateChange(this.onStateChange.bind(this));

        this.appContainer = this.getElement('.appContainer');
        this.appFrame = this.getElement<HTMLIFrameElement>('#appFrame');
        this.homeFrame = this.getElement<HTMLIFrameElement>('#homeFrame');

        this.keyboard = new KeyboardPage();
        this.alertPopup = new AppAlert();
        this.confirmPopup = new AppAlert(true);
        this.selectList = new SelectList();
        this.incomingCall = new IncomingCall();
        this.callScreen = new CallScreen();
        this.datePicker = new DatePicker();
        this.timePicker = new TimePicker(this);
        this.timeWheel = new TimeWheel();
        this.yearPicker = new YearPicker();
        this.chooseList = new ChooseList();

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
        this.updateClock(false, false);
    }

    get hour12() {
        return this._hour12;
    }
    set hour12(hour12: boolean) {
        this._hour12 = hour12;
        this.updateClock(false, false);
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
        const now = new OSDate().getDateByTimeZone(this.timeZone);
        const hours = now.getHours();
        const minutes = now.getMinutes();

        let hourString = hours.toString();
        const isAm = hours < 12 ? 'AM' : 'PM';
        if (this.hour12) {
            hourString = (hours % 12 || 12).toString();
        }

        const minuteString = minutes < 10 ? '0' + minutes : minutes;

        if (!timer) {
            if (stopwatch) {
                clockElement.innerHTML = `
                    ${hourString}:${minuteString}${this.hour12 ? ` ${isAm}` : ''}
                    <span class="material-symbols-outlined fill-icon" style="font-size: 22px; translate: 0 -2px; margin-left: 2px">timer</span>
                `;
            } else {
                clockElement.textContent = `${hourString}:${minuteString}${this.hour12 ? ` ${isAm}` : ''}`;
            }
        }
    }

    public resetDevice() {
        this.closeApp();
        this._appHistory = {};
    }

    private init() {
        const nav = this.getElement('.navigationBar-btn');
        // this.updateClock = this.updateClock.bind(this);

        this.updateClock(false, false);

        setTimeout(() => {
            this.onStateChange(history.state);
        }, 1000);

        nav.addEventListener('click', () => {
            this.history.setUrl('/', 'app');
        });
    }

    private onStateChange(state: string) {
        const path = window.location.pathname;

        const pathes = path.split('/');
        if (this.app && this.app === pathes[1]) return;
        this.app = path[1];

        if (path && path !== '/') {
            console.log('OPEN_APP', state);
            this.openApp(`/src/apps/${pathes[1]}/index.html`);
        } else {
            this.closeApp();
        }
    }

    private openApp(src: string) {
        this.appFrame.src = src;

        this.homeFrame.classList.add('hide');
        this.appContainer.classList.remove('hide');
        this.appContainer.classList.add('show');

        this.dispatchCustomEvent('openApp');
        const transitionEndHandler = () => {
            this.setTheme(this.theme);
            this.dispatchCustomEvent('openAppFinished');
            this.appContainer.removeEventListener('transitionend', transitionEndHandler);
        };
        this.appContainer.addEventListener('transitionend', transitionEndHandler);
    }

    private closeApp() {
        this.homeFrame.classList.remove('hide');
        this.appContainer.classList.remove('show');
        this.appContainer.classList.add('hide');

        this.dispatchCustomEvent('closeApp');

        this.datePicker.closePage();
        this.timePicker.closePage();
        this.yearPicker.closePage();
        this.selectList.closePage();
        this.chooseList.closePage();
        this.keyboard.close();

        const transitionEndHandler = () => {
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
            <span class="material-symbols-outlined fill-icon" style="font-size: 22px; translate: 0 -1px;">${icon}</span>
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