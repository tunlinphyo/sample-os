import '../../style.css';
import './settings.css';

import { HistoryStateManager } from "../../device/history.manager";
import { SettingApp } from './pages/app.page';
import { TogglePage } from './pages/toggle.page';
import { SettingAppController } from './app.controller';
import { ApplicationsPage } from './pages/applications.page';
import { SystemPage } from './pages/system/index.page';
import { SoftwareUpdatePage } from './pages/system/update.pages';
import { StoragePage } from './pages/storage.page';
import { BatteryPage } from './pages/battery.page';
import { DateTimePage } from './pages/system/date-time.page';
import { DisplayPage } from './pages/display.page';
import { SoundsPage } from './pages/sounds.page';

document.body.dataset.schema = parent.device.theme;

document.addEventListener('DOMContentLoaded', () => {
    const historyManager = new HistoryStateManager();

    new SettingApp(historyManager, parent.device, parent.setting);
    const togglePage = new TogglePage(historyManager, parent.device, parent.setting);
    const displayPage = new DisplayPage(historyManager, parent.device, parent.setting);
    const soundsPage = new SoundsPage(historyManager, parent.device, parent.setting);
    const appsPage = new ApplicationsPage(historyManager, parent.device, parent.setting);
    const systemPage = new SystemPage(historyManager);
    const softwareUpdatePage = new SoftwareUpdatePage(historyManager, parent.device, parent.setting);
    const storagePage = new StoragePage(historyManager, parent.device, parent.setting);
    const batteryPage = new BatteryPage(historyManager);
    const dateTimePage = new DateTimePage(historyManager, parent.device, parent.setting);

    new SettingAppController(
        historyManager,
        parent.device,
        parent.setting,
        togglePage,
        displayPage,
        soundsPage,
        appsPage,
        systemPage,
        softwareUpdatePage,
        storagePage,
        batteryPage,
        dateTimePage
    );
});