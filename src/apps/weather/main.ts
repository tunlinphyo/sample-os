import '../../style.css';
import './weather.css';

import { HistoryStateManager } from '../../device/history.manager';
import { WeatherApp } from './pages/app.page';
import { CitiesPage } from './pages/cities.page';
import { weatherAppController } from './app.controller';

document.body.dataset.schema = parent.device.theme;

document.addEventListener('DOMContentLoaded', () => {
    const historyManager = new HistoryStateManager();

    new WeatherApp(historyManager, parent.weather);
    const citiesPage = new CitiesPage(historyManager, parent.device, parent.weather);

    new weatherAppController(
        historyManager,
        parent.device,
        parent.weather,
        citiesPage
    );
});