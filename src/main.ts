import './style.css';

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
import { AlarmAlert } from './components/system/alarm.alert';
import { TimerAlert } from './components/system/timer.alert';
import { NotificationController } from './controllers/notification.controller';
import { SystemUpdate } from './components/system/system.update';
import { VolumeControls } from './components/system/volume.controls';
import { NotificationStore } from './stores/noti.store';
import { AudioController } from './controllers/audio.controller';
import { ArtistStore } from './stores/artist.store';
import { AlbumStore } from './stores/album.store';
import { MusicStore } from './stores/music.store';
import { MusicController } from './controllers/music.controller';
import { SongStore } from './stores/songs.store';
// import { FullscreenController } from './controllers/fullscreen.controller';

// import './apps/books/services/ebook';

document.addEventListener('DOMContentLoaded', async () => {
    const historyManager = new HistoryStateManager();

    const notiStore = new NotificationStore();
    const settingStore = new SettingStore();
    const clockStore = new ClockStore();
    const alarmStore = new ClockAlarmStore();
    const contactsStore = new ContactsStore();
    const blocksStore = new BlocksStore();
    const historyStore = new HistoryStore();
    const eventStore = new CalendarEventStore();
    const weatherStore = new WeatherStore();
    // Music
    const artistStore = new ArtistStore();
    const albumStore = new AlbumStore();
    const songStore = new SongStore();
    const musicStore = new MusicStore();

    const osaudio = new AudioController();
    const device = new DeviceController(historyManager);
    const settings = new SettingsController(historyManager, settingStore);
    const clock = new ClockController(clockStore, alarmStore);
    const phone = new PhoneController(historyStore, contactsStore, blocksStore);
    const calendar = new CalendarController(eventStore);
    const weather = new WeatherController(weatherStore);
    const music = new MusicController(artistStore, albumStore, songStore, musicStore, osaudio)

    window.device = device;
    window.setting = settings;
    window.clock = clock;
    window.phone = phone;
    window.calendar = calendar;
    window.weather = weather;
    window.osaudio = osaudio;
    window.music = music;

    const lockedScreen = new LockedScreenPage(historyManager, window.device);
    const alarmAlert = new AlarmAlert(window.device, window.phone);
    const timerAlert = new TimerAlert(window.device, window.phone);
    new PhoneDummyController(window.device, window.phone, window.setting, window.osaudio);
    new GestureService(historyManager, window.device, lockedScreen);
    new NotificationController(historyManager, notiStore, window.device, window.phone, window.clock, window.weather, window.setting, window.music);
    new VolumeControls(window.device, window.setting);
    // new Battery();
    // const fullScreen = new FullscreenController();

    window.weather.fetchWeather();

    let inCall: boolean = false;

    window.clock.addChangeListener(async (status: string, data: any) => {
        if (status === 'SHOW_ALARM' && !inCall) {
            const defaultAlert = window.setting.volumes.defaultAlert;
            window.osaudio.playAlert(defaultAlert);
            const alarm = await alarmAlert.open('Alarm', data);
            window.osaudio.stopAlert();
            if (alarm && typeof alarm !== 'boolean') {
                window.clock.snoozeAlarm(alarm.id);
            }
        }
        if (status === 'TIMER_ALERT' && !inCall) {
            const defaultAlert = window.setting.volumes.defaultAlert;
            window.osaudio.playAlert(defaultAlert);
            const timer = await timerAlert.open("Timer", data);
            if (timer) window.clock.timerStart();
            window.osaudio.stopAlert();
        }
    });

    // document.getElementById("fullScreen")!.addEventListener("click", () => {
    //     if (fullScreen.isFullScreenMode()) {
    //         fullScreen.closeFullscreen();
    //     } else {
    //         fullScreen.openFullscreen(document.body);
    //     }
    // });

    const systemUpdate = new SystemUpdate(window.device);
    window.setting.addChangeListener((status: string, data: any) => {
        if (status === 'UPDATE_THEME') {
            window.device.theme = data.value;
        }
        if (status === 'OS_UPDATE_START') {
            systemUpdate.open('', undefined);
            window.device.resetDevice();
        }
        if (status === 'OS_UPDATE_END' && systemUpdate) {
            systemUpdate.close();
            window.location.reload();
        }
        if (status === 'UPDATE_TIMEZONE' || status == 'UPDATE_HOUR12') {
            if (!data) return;
            const info = data.data as DateTimeInfo;
            window.device.timeZone = info.timeZone;
            window.device.hour12 = info.hour12;
        }
        if (status === 'UPDATE_VOLUMES') {
            window.osaudio.volume = data;
        }
    });

    window.weather.addChangeListener((status: string, data: any) => {
        if (status === 'MY_WEATHER_FETCH') {
            lockedScreen.update(status, data);
        }
    })

    window.phone.addChangeListener((status: string, data: any) => {
        if (status === 'IN_CALL') {
            inCall = data;
            window.osaudio.inCall = data;
        }
    });

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('TimeZones', timeZone);
});
