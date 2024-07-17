import { WeatherController } from "../../controllers/weather.controller";
import { DeviceController } from "../../device/device";
import { HistoryState, HistoryStateManager } from "../../device/history.manager";
import { CitiesPage } from "./pages/cities.page";


export class weatherAppController {
    constructor(
        private history: HistoryStateManager,
        private device: DeviceController,
        private weather: WeatherController,
        private citiesPage: CitiesPage
    ) {
        this.renderListeners();
    }


    private renderListeners() {
        const handleChange = (_: any, url: string) => {
            this.history.handleChange(url, [
                {
                    pattern: '/weathers',
                    callback: () => {
                        this.citiesPage.openPage('Weather', this.weather.weathers);
                    }
                }
            ]);
        }

        this.history.onStateChange(handleChange);

        this.device.addEventListener('openAppFinished', () => {
            const history = parent.device.getHistory('weather');
            if (!history) return;
            this.history.init(history);
            // // console.log('OPEN_PAGE', JSON.stringify(history));
            history.forEach((item: HistoryState) => {
                handleChange(item.state, item.url);
            })
        })

        this.device.addEventListener('closeApp', () => {
            // // console.log('CLOSE_PAGE', JSON.stringify(this.history.history));
            this.device.setHistory('weather', this.history.history);
        });
    }
}