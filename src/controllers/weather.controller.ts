import { BaseController } from './base.controller';
import { MY_LOCATION_ID, Weather, WeatherStore } from '../stores/weather.store';
import { CITIES, CITY, LocationData } from '../utils/cities';
import WeatherWorker from '../workers/weather.worker.ts?worker&inline';
import { WeatherService } from '../services/weather.service';

export class WeatherController extends BaseController {
    private weatherWorker: Worker;

    public weathers: Weather[] = [];
    public _location: LocationData = CITY;

    constructor(
        private store: WeatherStore,
    ) {
        super();
        this.weatherWorker = new WeatherWorker();
        this.setupListeners();
        this.weatherWorker.postMessage({ command: 'init', data: this.myLocation });
    }

    get myLocation() {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const location = CITIES.find(location => location.timeZone === timeZone) || CITY;
        this._location = location;
        return location;
    }

    get currentLocation() {
        return this._location;
    }
    set currentLocation(locations: LocationData) {
        this._location = locations;
        this.fetchWeather(locations);
    }

    private setupListeners() {

        this.store.listen((list) => {
            this.weathers = list;
            this.notifyListeners('CITY_LIST_CHANGED', list);
        });

        this.weatherWorker.addEventListener('message', (event) => {
            const { status, location, weather } = event.data;

            if (status === "fetch") {
                const exist = this.getWeather(location.timeZone);
                this.tryThis(async () => {
                    if (exist) await this.store.update(location.timeZone, { location, weather })
                    else await this.store.add({ location, weather }, location.timeZone);
                    this.notifyListeners('WEATHER_FEACHED', { id: location.timeZone, location, weather});
                    if (this.myLocation.timeZone === location.timeZone) {
                        this.notifyListeners('WEATHER_NOTIFIGATION', { location, weather});
                    }
                });
            }
            if (status === "location") {
                const exist = this.getWeather(MY_LOCATION_ID);
                this.tryThis(async () => {
                    if (exist) await this.store.update(MY_LOCATION_ID, { location, weather })
                    else await this.store.add({ location, weather }, MY_LOCATION_ID);
                    this.notifyListeners('WEATHER_FEACHED', { id: MY_LOCATION_ID, location, weather});
                });
                if (this.myLocation.timeZone === location.timeZone) {
                    this.notifyListeners('MY_WEATHER_FETCH', weather);
                }
                if (WeatherService.getNotifigation(weather)) {
                    this.notifyListeners('WEATHER_NOTIFIGATION', { location, weather});
                }
            }
        });
    }

    public getLocation(timeZone: string) {
        const location = CITIES.find(location => location.timeZone === timeZone);
        return location || this.currentLocation;
    }

    public getWeather(id: string) {
        return this.store.get(id);
    }

    public deleteWeather(id: string) {
        this.tryThis(async() => {
            await this.store.del(id);
            this.notifyListeners('WEATHER_DELETED', id);
        });
    }

    public getFirstOne() {
        const weather = this.weathers[0];
        this.currentLocation = weather.location;
    }

    public async fetchWeather(location?: LocationData) {
        if (!location) location = this.currentLocation;
        this.weatherWorker.postMessage({ command: 'fetch', data: location });
    }
}