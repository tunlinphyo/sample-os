import { HistoryStateManager } from "../device/history.manager";
import { DateTimeInfo, HomeApp, Setting, SettingStore } from "../stores/settings.store";
import { BaseController } from "./base.controller";


export class SettingsController extends BaseController {
    private _apps: HomeApp[] = [];
    public settings: Setting[] = [];

    constructor(
        public history: HistoryStateManager,
        private settingsStore: SettingStore
    ) {
        super();
        this.setupListeners();
    }

    get apps() {
        return this._apps;
    }

    set apps(apps: HomeApp[]) {
        this._apps = apps;
        this.notifyListeners('APPLOADED', apps)
    }

    get version() {
        return this.settingsStore.version;
    }

    get message() {
        return this.settingsStore.message;
    }

    get timeInfo(): DateTimeInfo {
        const dateTime = this.getSettingItem('date-time');
        return dateTime?.data;
    }

    get timeZone(): string {
        const dateTime = this.getSettingItem('date-time');
        if (dateTime?.data.autoTimeZone) Intl.DateTimeFormat().resolvedOptions().timeZone;
        return dateTime?.data.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    set timeZone(timeZone: string) {
        this.tryThis(async () => {
            const dateTime = this.getSettingItem('date-time');
            if (!dateTime) return;
            dateTime.data.timeZone = timeZone;
            dateTime.data.autoTimeZone = false;
            await this.settingsStore.update('date-time', dateTime);
            this.notifyListeners('UPDATE_TIMEZONE', dateTime);
        });
    }

    set autoZone(auto: boolean) {
        this.tryThis(async () => {
            const dateTime = this.getSettingItem('date-time');
            if (!dateTime) return;
            dateTime.data.autoTimeZone = auto;
            dateTime.data.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            await this.settingsStore.update('date-time', dateTime);
            this.notifyListeners('UPDATE_TIMEZONE', dateTime);
        });
    }

    get hour12(): boolean {
        const dateTime = this.getSettingItem('date-time');
        return dateTime?.data.hour12 || true;
    }

    set hour12(is24: boolean) {
        this.tryThis(async () => {
            const dateTime = this.getSettingItem('date-time');
            if (!dateTime) return;
            dateTime.data.hour12 = is24;
            await this.settingsStore.update('date-time', dateTime);
            this.notifyListeners('UPDATE_HOUR12', dateTime);
        });
    }

    private setupListeners() {
        this.settingsStore.listen((list, item, operation) => {
            this.settings = list;
            if (operation === 'loaded') {
                const apps = this.settingsStore.get('apps');
                this.apps = apps?.data || [];

                const dateTime = this.settingsStore.get('date-time');
                this.notifyListeners('UPDATE_TIMEZONE', dateTime);

                const display = this.settingsStore.get('display');
                this.notifyListeners('UPDATE_THEME', display);
            }
            if (item && item.id === 'apps') {
                this.apps = item.data || [];
            }
        });
    }

    public updateOS() {
        this.notifyListeners('OS_UPDATE_START', null);
        this.tryThis(async () => {
            setTimeout(async () => {
                await this.settingsStore.resetStore();
                this.notifyListeners('OS_UPDATE_END', null);
            }, 3000)
        })
    }

    public appsReady() {
        this.notifyListeners('APPLOADED', this.apps);
    }

    public updateTheme(data: Setting) {
        this.tryThis(async () => {
            await this.settingsStore.update('display', data);
            this.notifyListeners('UPDATE_THEME', data);
        });
    }

    public updateApps(data: Setting) {
        this.tryThis(async () => {
            await this.settingsStore.update('apps', data);
            this.notifyListeners('UPDATE_APPS', data);
        });
    }

    public toggleSetting(data: Setting) {
        this.tryThis(async () => {
            await this.settingsStore.toggleValue(data.id);
            this.notifyListeners('TOGGLE_VALUE', data);
        });
    }

    public getSettingItem(id: string) {
        return this.settingsStore.get(id);
    }

}