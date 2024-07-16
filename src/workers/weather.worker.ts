/// <reference lib="webworker" />
import { WeatherService } from "../services/weather.service";

const weatherService = new WeatherService(import.meta.env.VITE_WEATHER_API_KEY);

addEventListener('message', (event) => {
    const { command, data } = event.data;

    console.log("WEATHER_WORKER", command, data);

    switch (command) {
        case 'init':
            weatherService.init(data);
            break;
        case 'fetch':
            weatherService.fetchWeather(data);
            break;
    }
});