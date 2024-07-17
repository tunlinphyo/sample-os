import { DeviceController } from "../../device/device";
import { HistoryState, HistoryStateManager } from "../../device/history.manager";
import { MapsController } from "./maps.controller";
import { ExplorePage } from "./pages/explore.page";
import { OpeningHours } from "./pages/opening.modal";
import { PlacePage } from "./pages/place.page";
import { PlacesPage } from "./pages/places.page";



export class MapsAppController {
    constructor(
        private history: HistoryStateManager,
        private maps: MapsController,
        private device: DeviceController,
        private explorePage: ExplorePage,
        private placesPage: PlacesPage,
        private placePage: PlacePage,
        private openingHours: OpeningHours
    ) {
        this.renderListeners();
    }

    private renderListeners() {
        const handleChange = (state: any, url: string) => {
            this.history.handleChange(url, [
                {
                    pattern: '/explore',
                    callback: () => {
                        console.log('EXPLORE', state, this.maps.explore);
                        this.explorePage.openPage('Explore', state || this.maps.explore);
                    }
                }, {
                    pattern: '/places',
                    callback: () => {
                        this.placesPage.openPage('Places', this.maps.places);
                    }
                }, {
                    pattern: '/places/detail',
                    callback: () => {
                        if (state) {
                            this.placePage.openPage('Place', JSON.parse(state));
                            this.maps.getPlace(JSON.parse(state));
                        }
                    }
                }, {
                    pattern: '/places/detail/openings',
                    callback: () => {
                        if (state) {
                            this.openingHours.openPage('Opening Hours', state);
                        }
                    }
                }
            ]);
        }

        this.history.onStateChange(handleChange);

        this.device.addEventListener('openAppFinished', () => {
            const history = parent.device.getHistory('maps');
            if (!history) return;
            // console.log('OPEN_PAGE', history);
            this.history.init(history);
            history.forEach((item: HistoryState) => {
                handleChange(item.state, item.url);
            })
        })

        this.device.addEventListener('closeApp', () => {
            // console.log('CLOSE_PAGE', JSON.stringify(this.history.history));
            this.device.setHistory('maps', this.history.history);
        });
    }
}