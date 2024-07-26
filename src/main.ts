import './style.css';

import { SystemUpdate } from './components/system/update';
import { CalendarController } from './controllers/calendar.controller';
import { ClockController } from './controllers/clock.controller';
import { PhoneController } from './controllers/phone.controller';
import { PhoneDummyController } from './controllers/phone.dummy.controller';
import { SettingsController } from './controllers/settings.controller';
// import { Battery } from './device/battery';
import { DeviceController } from './device/device';
import { HistoryStateManager } from './device/history.manager';
import { ClockAlarmStore } from './stores/alarm.store';
import { BlocksStore } from './stores/blocked.store';
import { ClockStore } from './stores/clock.store';
import { ContactsStore } from './stores/contact.store';
import { CalendarEventStore } from './stores/event.store';
import { HistoryStore } from './stores/history.store';
import { DateTimeInfo, SettingStore } from './stores/settings.store';
import { WeatherStore } from './stores/weather.store';
import { WeatherController } from './controllers/weather.controller';
import { GestureService } from './services/gesture.service';
import { LockedScreenPage } from './components/system/locked.screen';
// import { NotificationController } from './controllers/notification.controller';
// import { FullscreenController } from './controllers/fullscreen.controller';

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

    const lockedScreen = new LockedScreenPage(historyManager, window.device);
    new PhoneDummyController(window.device, window.phone);
    new GestureService(historyManager, window.device, lockedScreen);
    // new NotificationController(historyManager, window.device, window.phone, window.clock, window.weather);
    // new Battery();
    // const fullScreen = new FullscreenController();

    // window.weather.fetchWeather();

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

    // document.getElementById("fullScreen")!.addEventListener("click", () => {
    //     if (fullScreen.isFullScreenMode()) {
    //         fullScreen.closeFullscreen();
    //     } else {
    //         fullScreen.openFullscreen(document.body);
    //     }
    // });

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
            // console.log('UPDATE_TIMEZONE', info);
            window.device.timeZone = info.timeZone;
            window.device.hour12 = info.hour12;
        }
    });

    window.weather.addChangeListener((status: string, data: any) => {
        if (status === 'WEATHER_NOTIFIGATION') {
            console.log('WEATHER::::::::::', data);
        }
        if (status === 'MY_WEATHER_FETCH') {
            console.log('MY_WEATHER_FETCH', data);
            lockedScreen.update(status, data);
        }
    })

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('TimeZones', timeZone);
});
