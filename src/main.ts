import { SystemUpdate } from './components/system/update';
import { ClockController } from './controllers/clock.controller';
import { PhoneController } from './controllers/phone.controller';
import { PhoneDummyController } from './controllers/phone.dummy.controller';
import { SettingsController } from './controllers/settings.controller';
import { Battery } from './device/battery';
import { DeviceController } from './device/device';
import { HistoryStateManager } from './device/history.manager';
import { ClockAlarmStore } from './stores/alarm.store';
import { BlocksStore } from './stores/blocked.store';
import { ClockStore } from './stores/clock.store';
import { ContactsStore } from './stores/contact.store';
import { History, HistoryStore } from './stores/history.store';
import { DateTimeInfo, SettingStore } from './stores/settings.store';
import './style.css'

document.addEventListener('DOMContentLoaded', async () => {
    const historyManager = new HistoryStateManager();

    const settingStore = new SettingStore();
    const clockStore = new ClockStore();
    const alarmStore = new ClockAlarmStore();
    const contactsStore = new ContactsStore();
    const blocksStore = new BlocksStore();
    const historyStore = new HistoryStore();

    const device = new DeviceController(historyManager);
    const settings = new SettingsController(historyManager, settingStore);
    const clock = new ClockController(clockStore, alarmStore);
    const phone = new PhoneController(historyStore, contactsStore, blocksStore);

    window.device = device;
    window.setting = settings;
    window.clock = clock;
    window.phone = phone;

    new PhoneDummyController(window.device, window.phone);
    new Battery();

    window.clock.addChangeListener((status: string, data: any) => {
        if (status === 'UPDATE_CLOCK') {
            window.device.updateClock(data.timer, data.stopwatch);
        }
    });

    window.device.callScreen.listen<Omit<History, "id">>('callDone', (data) => {
        if (data) window.phone.addHistory(data);
    });

    let systemUpdate: SystemUpdate | undefined;
    window.setting.addChangeListener((status: string, data: any) => {
        if (status === 'UPDATE_THEME') {
            window.device.theme = data.value;
        }
        if (status === 'OS_UPDATE_START') {
            systemUpdate = new SystemUpdate();
            systemUpdate.openPage();
            window.device.resetDevice();
        }
        if (status === 'OS_UPDATE_END' && systemUpdate) {
            systemUpdate.closePage();
            systemUpdate = undefined;
        }
        if (status === 'UPDATE_TIMEZONE' || status == 'UPDATE_HOUR12') {
            const info = data.data as DateTimeInfo;
            console.log('UPDATE_TIMEZONE', info);
            window.device.timeZone = info.timeZone;
            window.device.hour12 = info.hour12;
        }
    });

    // const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // console.log('TimeZones', timeZone);
});