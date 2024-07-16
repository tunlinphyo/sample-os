import './style.css';

import { SystemUpdate } from './components/system/update';
import { CalendarController } from './controllers/calendar.controller';
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
import { CalendarEventStore } from './stores/event.store';
import { History, HistoryStore } from './stores/history.store';
import { DateTimeInfo, SettingStore } from './stores/settings.store';
import { WeatherStore } from './stores/weather.store';
import { WeatherController } from './controllers/weather.controller';

document.addEventListener('DOMContentLoaded', async () => {
    const historyManager = new HistoryStateManager();

    const settingStore = new SettingStore();
    const clockStore = new ClockStore();
    const alarmStore = new ClockAlarmStore();
    const contactsStore = new ContactsStore();
    const blocksStore = new BlocksStore();
    const historyStore = new HistoryStore();
    const eventStore = new CalendarEventStore();
    const weatherStore = new WeatherStore();

    const device = new DeviceController(historyManager);
    const settings = new SettingsController(historyManager, settingStore);
    const clock = new ClockController(clockStore, alarmStore);
    const phone = new PhoneController(historyStore, contactsStore, blocksStore);
    const calendar = new CalendarController(eventStore);
    const weather = new WeatherController(weatherStore);

    window.device = device;
    window.setting = settings;
    window.clock = clock;
    window.phone = phone;
    window.calendar = calendar;
    window.weather = weather;

    new PhoneDummyController(window.device, window.phone);
    new Battery();

    window.clock.addChangeListener(async (status: string, data: any) => {
        if (status === 'UPDATE_CLOCK') {
            window.device.updateClock(window.clock.timerRunning, window.clock.stopwatchRunning);
        }
        if (status === 'SHOW_ALARM') {
            window.device.alertPopup.openPage('Alarm', data.label);
        }
        if (status === 'TIMER_UPDATE') {
            window.device.updateCountDown(
                window.clock.remaining,
                window.clock.timerRunning ? 'timer_pause' : 'timer_play'
            );
        }
        if (status === 'TIMER_ALERT') {
            await window.device.alertPopup.openPage('Timer', {
                message: "Timer done", btn: {
                    label: 'REPEAT',
                    callback: () => {
                        window.clock.timerStart();
                    }
                }
            });
            window.device.updateClock(window.clock.timerRunning, window.clock.stopwatchRunning);
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

    window.weather.addChangeListener((status: string, data: any) => {
        if (status === 'WEATHER_LOCATION') {
            console.log('WEATHER::::::::::', data);
        }
    })

    // const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // console.log('TimeZones', timeZone);
});