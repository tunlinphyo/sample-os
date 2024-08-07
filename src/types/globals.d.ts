import { CalendarController } from "../controllers/calendar.controller";
import { ClockController } from "../controllers/clock.controller";
import { PhoneController } from "../controllers/phone.controller";
import { SettingsController } from "../controllers/settings.controller";
import { WeatherController } from "../controllers/weather.controller";
import { DeviceController } from "../device/device";

declare global {
    interface Window {
        device: DeviceController;
        clock: ClockController;
        setting: SettingsController;
        phone: PhoneController;
        calendar: CalendarController;
        weather: WeatherController;
    }
}

export {};