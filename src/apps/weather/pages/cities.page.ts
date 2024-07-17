import { Page } from "../../../components/page";
import { SelectItem } from "../../../components/select";
import { WeatherController } from "../../../controllers/weather.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { MY_LOCATION_ID, Weather } from "../../../stores/weather.store";
import { CITIES, LocationData } from "../../../utils/cities";

export class CitiesPage extends Page {
    private cityList: SelectItem[] = CITIES.map(item => ({ title: item.city, value: item.timeZone })).sort((a, b) => {
        return a.title.localeCompare(b.title);
    });

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private weather: WeatherController
    ) {
        super(history, { btnEnd: 'add' });
        this.init();
    }

    init() {
        this.addEventListener('click', async () => {
            const select = await this.device.selectList.openPage('Cities', this.cityList, 'contacts');
            if (select) {
                const city = CITIES.find(item => item.timeZone === select)! as LocationData;
                this.weather.currentLocation = city;
            }
        }, this.btnEnd, false);

        this.weather.addChangeListener((status: string, data: any) => {
            if (status === 'CITY_LIST_CHANGED') {
                this.update("update", data);
            }
        });
    }

    render(list: Weather[]) {
        const scrollArea = this.createScrollArea();
        const cityList = this.createElement('div', ['cityList']);
        for(const item of this.sortByName(list)) {
            const { id, location, weather } = item;

            const cityEl = this.createElement('button', ['city']);
            const isMyLocation = id === MY_LOCATION_ID;
            cityEl.innerHTML = `
                <span class="weatherDetail">
                    <span class="itemTitle">${isMyLocation ? 'My Location' : location.city}</span>
                    <span class="status">${weather.weather[0].description}</span>
                </span>
                <span class="temperature">${Math.round(weather.main.temp)}&deg;</span>
            `;
            // console.log("ON_CLICK", cityEl);
            this.addEventListener('click', () => {
                this.onCitySelect(item, isMyLocation);
            }, cityEl);
            cityList.appendChild(cityEl);
        }

        scrollArea.appendChild(cityList);
        this.mainArea.appendChild(scrollArea);
    }

    update(_: string, list: Weather[]) {
        if (!this.isActive) return;
        // this.removeAllEventListeners();
        this.mainArea.innerHTML = '';
        this.render(list);
    }


    private sortByName(data: Weather[]) {
        return data.sort((a, b) => {
            const aName = a.id === MY_LOCATION_ID ? 'a' : a.location.city;
            const bName = b.id === MY_LOCATION_ID ? 'a' : b.location.city;
            return (aName).localeCompare(bName);
        });
    }

    private async onCitySelect(item: Weather, myLocation: boolean) {
        const { id, location } = item;
        if (myLocation) {
            this.weather.currentLocation = location;
        } else {
            const list: SelectItem[] = [
                {
                    title: 'View',
                    value: 'view',
                    icon: 'sunny'
                },
                {
                    title: 'Delete',
                    value: 'delete',
                    icon: 'delete'
                }
            ];
            const selected = await this.device.selectList.openPage(location.city, list);
            if (selected === 'view') {
                this.weather.currentLocation = location;
            } else if (selected === 'delete') {
                this.weather.deleteWeather(id);
            }
        }
        this.closePage()
    }
}
