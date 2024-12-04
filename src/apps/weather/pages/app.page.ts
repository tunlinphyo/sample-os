import { App } from "../../../components/app";
import { WeatherController } from "../../../controllers/weather.controller";
import { HistoryStateManager } from "../../../device/history.manager";
import { WeatherService } from "../../../services/weather.service";
import { Weather } from "../../../stores/weather.store";

export class WeatherApp extends App {
    private current: Weather | undefined;

    constructor(
        history: HistoryStateManager,
        private weather: WeatherController
    ) {
        super(history, { template: 'actionTemplate', btnEnd: 'list' });

        this.init();
        this.weather.fetchWeather();
    }

    private init() {
        this.addEventListener('click', () => {
            this.history.pushState('/weathers', null);
        }, this.btnEnd, false);

        this.weather.addChangeListener((status: string, data: any) => {
            if (status === 'WEATHER_FEACHED') {
                this.update("update", data);
                this.weather.closeNoti();
            }
            if (status === 'WEATHER_DELETED' && data === this.current?.id) {
                this.weather.getFirstOne();
            }
        });
    }

    render(data?: Weather) {
        if (!data) {
            const loadingContainer = this.createElement('div', ['loadingContainer']);
            const loader = this.createElement('div', ['loader']);

            loadingContainer.appendChild(loader);
            this.mainArea.appendChild(loadingContainer);
            return;
        }
        this.current = data;
        if (!this.current) return;

        const { location, weather } = this.current;

        const title = this.getElement('.statusBar-title');
        title.textContent = location.city;

        const weatherData = this.createElement('div', ['weatherData']);

        const iconEl = this.createElement('div', ['weatherIcon']);
        iconEl.innerHTML = `<span class="material-symbols-outlined icon fill-icon">${WeatherService.getIcon(weather.weather[0].icon)}</span>`;
        weatherData.appendChild(iconEl);

        const tempEl = this.createElement('div', ['temperture']);
        tempEl.innerHTML = `${Math.round(weather.main.temp)}&deg;`;
        weatherData.appendChild(tempEl);

        const lowHeight = this.createElement('div', ['lowHeight']);
        lowHeight.innerHTML = `L:${Math.round(weather.main.temp_min)}&deg; <span></span> H:${Math.round(weather.main.temp_max)}&deg;`;
        weatherData.appendChild(lowHeight);

        const statusText = this.createElement('div', ['statusText']);
        statusText.innerHTML = weather.weather[0].description;
        weatherData.appendChild(statusText);

        const weatherGroup = this.createElement('div', ['weatherGroup']);

        const firstStatus = this.createElement('div', ['statusGroup']);
        let cloudData:number = weather.clouds.all;
        let icon:string = 'filter_drama';

        if (weather['rain']) {
            icon = 'rainy';
            data = weather['rain']["1h"];
        }
        if (weather['snow']) {
            icon = 'ac_unit';
            data = weather['snow']["1h"];
        }

        firstStatus.innerHTML = `
            <span class="material-symbols-outlined">${icon}</span>
            <span>${cloudData}${icon === 'filter_drama' ? '%' : 'mm'}</span>
        `;
        weatherGroup.appendChild(firstStatus);

        const secondStatus = this.createElement('div', ['statusGroup']);
        secondStatus.innerHTML = `
            <span class="material-symbols-outlined">water_drop</span>
            <span>${weather.main.humidity}%</span>
        `;
        weatherGroup.appendChild(secondStatus);

        const thirdStatus = this.createElement('div', ['statusGroup']);
        thirdStatus.innerHTML = `
            <span class="material-symbols-outlined">air</span>
            <span>${Math.round(weather.wind.speed)}mph</span>
        `;
        weatherGroup.appendChild(thirdStatus);

        weatherData.appendChild(weatherGroup);

        // const [ sunRise, sunSet ] = WeatherService.getSunRiseAndSet(this.current);

        // const sunRiseGroup = this.createGroup('Sunrise');
        // const sunRiseEl = this.createGroupItem(sunRise.toISOString(), 'sunrise');
        // sunRiseGroup.appendChild(sunRiseEl);

        // const div = this.createElement('div', ['testScroll']);
        // weatherData.appendChild(div);


        // // console.log('SUN_RISE', sunRise, 'SUN_SET', sunSet);
        // weatherData.appendChild(sunRiseGroup);

        this.mainArea.appendChild(weatherData);
    }

    update(_: string, data: Weather) {
        this.mainArea.innerHTML = '';
        this.removeAllEventListeners();
        this.render(data)
    }
}
