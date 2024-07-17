import '../../style.css';
import './maps.css';

import { HistoryStateManager } from '../../device/history.manager';
import { MapsPlacesStore } from '../../stores/maps.store';
import { MapsController } from './maps.controller';
import { MapsApp } from './pages/app.page';
import { ExplorePage } from './pages/explore.page';
import { MapsAppController } from './app.controller';
import { PlacesPage } from './pages/places.page';
import { PlacePage } from './pages/place.page';
import { OpeningHours } from './pages/opening.modal';

document.body.dataset.schema = parent.device.theme;

document.addEventListener('DOMContentLoaded', () => {
    const historyManager = new HistoryStateManager();
    const mapsStore = new MapsPlacesStore();
    const mapsController = new MapsController(historyManager, mapsStore);

    new MapsApp(historyManager, mapsController);
    const explorePage = new ExplorePage(historyManager, mapsController, parent.device);
    const placesPage = new PlacesPage(historyManager, mapsController);
    const placePage = new PlacePage(historyManager, mapsController);
    const openingHours = new OpeningHours(historyManager);

    new MapsAppController(
        historyManager,
        mapsController,
        parent.device,
        explorePage,
        placesPage,
        placePage,
        openingHours
    );
});