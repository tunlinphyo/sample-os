import { SettingsController } from "../../controllers/settings.controller";
import { DeviceController } from "../../device/device";
import { HistoryState, HistoryStateManager } from "../../device/history.manager";
import { ApplicationsPage } from "./pages/applications.page";
import { BatteryPage } from "./pages/battery.page";
import { DisplayPage } from "./pages/display.page";
import { StoragePage } from "./pages/storage.page";
import { DateTimePage } from "./pages/system/date-time.page";
import { SystemPage } from "./pages/system/index.page";
import { SoftwareUpdatePage } from "./pages/system/update.pages";
import { TogglePage } from "./pages/toggle.page";
import { SoundsPage } from './pages/sounds.page';


export class SettingAppController {
    constructor(
        private history: HistoryStateManager,
        private device: DeviceController,
        private setting: SettingsController,
        private togglePage: TogglePage,
        private displayPage: DisplayPage,
        private soundsPage: SoundsPage,
        private appsPage: ApplicationsPage,
        private systemPage: SystemPage,
        private softwareUpdatePage: SoftwareUpdatePage,
        private storagePage: StoragePage,
        private batteryPage: BatteryPage,
        private dateTimePage: DateTimePage
    ) {
        this.renderListeners();
    }


    private renderListeners() {
        const handleChange = (state: any, url: string) => {
            this.history.handleChange(url, [
                {
                    pattern: '/toggles',
                    callback: () => {
                        const setting = this.setting.getSettingItem(state);
                        this.togglePage.openPage(setting?.title, setting);
                    }
                },
                {
                    pattern: '/sounds',
                    callback: () => {
                        const setting = this.setting.getSettingItem(state);
                        this.soundsPage.openPage(setting?.title, setting);
                    }
                },
                {
                    pattern: '/display',
                    callback: () => {
                        const setting = this.setting.getSettingItem(state);
                        this.displayPage.openPage(setting?.title, setting);
                    }
                }, {
                    pattern: '/applications',
                    callback: () => {
                        const setting = this.setting.getSettingItem(state);
                        this.appsPage.openPage(setting?.title, setting);
                    }
                }, {
                    pattern: '/storage',
                    callback: () => {
                        this.storagePage.openPage(state?.title, state);
                    }
                },  {
                    pattern: '/battery',
                    callback: () => {
                        this.batteryPage.openPage(state?.title, state);
                    }
                }, {
                    pattern: '/system',
                    callback: () => {
                        const setting = this.setting.getSettingItem(state);
                        this.systemPage.openPage(setting?.title, setting);
                    }
                }, {
                    pattern: '/system/update',
                    callback: () => {
                        if (state.id === 'software-update') {
                            this.softwareUpdatePage.openPage(state?.title, state);
                        } else  if (state.id === 'date-time') {
                            const setting = this.setting.getSettingItem('date-time');
                            this.dateTimePage.openPage(setting?.title, setting);
                        }
                    }
                },
            ]);
        }

        this.history.onStateChange(handleChange);

        this.device.addEventListener('openAppFinished', () => {
            const history = parent.device.getHistory('settings');
            if (!history) return;
            this.history.init(history);
            history.forEach((item: HistoryState) => {
                handleChange(item.state, item.url);
            })
        })

        this.device.addEventListener('closeApp', () => {
            console.log('CLOSE_PAGE', JSON.stringify(this.history.history));
            this.device.setHistory('settings', this.history.history);
        });
    }
}