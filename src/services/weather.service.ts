import OpenWeatherMapApi from "openweathermap-ts";
import { CurrentResponse } from "openweathermap-ts/dist/types";
import { LocationData } from '../utils/cities';

const icons: Record<string, string> = {
    '01d': 'sunny',
    '01n': 'clear_night',
    '02d': 'partly_cloudy_day',
    '02n': 'partly_cloudy_night',
    '03d': 'cloud',
    '03n': 'cloud',
    '04d': 'cloud',
    '04n': 'cloud',
    '09d': 'rainy_light',
    '09n': 'rainy_light',
    '10d': 'rainy',
    '10n': 'rainy',
    '11d': 'thunderstorm',
    '11n': 'thunderstorm',
    '13d': 'ac_unit',
    '13n': 'ac_unit',
    '50d': 'mist',
    '50n': 'mist',
}

export class WeatherService {
    private weatherApi: OpenWeatherMapApi;
    private location: LocationData | undefined;

    constructor(apiKey: string) {
        this.weatherApi = new OpenWeatherMapApi({
            apiKey: apiKey,
            units: 'metric', // You can use 'imperial' for Fahrenheit
            language: 'en',
        });
    }

    public init(location: LocationData) {
        this.location = location;
        const now = new Date();
        const delay = (60 - now.getSeconds()) * 1000;
        setTimeout(() => {
            this.fetchCurrentWeather(this.location);
            setInterval(() => {
                this.fetchCurrentWeather(this.location);
            }, 30 * 60 * 1000);
        }, delay);
    }

    public async getWeather(location: LocationData) {
        try {
            const weatherData = await this.weatherApi.getCurrentWeatherByGeoCoordinates(location.lat, location.lng);
            return weatherData;
        } catch (error) {
            if (error instanceof Error) {
                console.error('Failed to fetch weather data:', error.message);
            } else {
                console.log("Unknown error");
            }
            return null;
        }
    }

    public static getIcon(icon: string) {
        return icons[icon];
    }

    public static getSunRiseAndSet(weatherData: CurrentResponse) {
        const convertUnixTimestampToTime = (unixTimestamp: number, timezone: number) => {
            const date = new Date((unixTimestamp + timezone) * 1000);
            return date;
        }
        const sunrise = convertUnixTimestampToTime(weatherData.sys.sunrise, weatherData.timezone);
        const sunset = convertUnixTimestampToTime(weatherData.sys.sunset, weatherData.timezone);

        return [sunrise, sunset];
    }

    public async fetchWeather(location: LocationData) {
        const weather = await this.getWeather(location).catch(_ => null);
        if (weather) {
            let status = 'fetch';
            if (location.timeZone === this.location?.timeZone) {
                status = 'location';
            }
            postMessage({ status, location, weather });
        }
    }

    private async fetchCurrentWeather(location?: LocationData) {
        if (!location) return;
        const weather = await this.getWeather(location).catch(_ => null);
        if (weather) {
            postMessage({ status: 'location', location, weather });
        }
    }
}