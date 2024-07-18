import { App } from "../../../components/app";
import { HistoryStateManager } from "../../../device/history.manager";
import { MapsController } from "../maps.controller";

export class MapsApp extends App {
    public mapsContainer: HTMLElement;

    constructor(
        history: HistoryStateManager,
        private maps: MapsController
    ) {
        super(history, {
            template: 'mapsTemplate',
            btnStart: 'explore',
            btnCenter: 'my_location',
            btnEnd: 'bookmarks'
        });
        this.mapsContainer = this.getElement('.mapsArea');

        this.maps.initMap(this.mapsContainer);
        this.init();
    }

    private init() {
        this.addEventListener('click', () => {
            this.history.pushState('/explore', null);
        }, this.btnStart, false);

        this.addEventListener('click', () => {
            this.maps.service.centerOnCurrentLocation();
        }, this.btnCenter, false);

        this.addEventListener('click', () => {
            this.history.pushState('/places', []);
        }, this.btnEnd, false);

        this.render();
    }

    render() {
        const loadingContainer = this.createElement('div', ['loadingContainer', 'mapLoadingContainer']);
        const loader = this.createElement('div', ['loader']);

        loadingContainer.appendChild(loader);
        this.mapsContainer.appendChild(loadingContainer);
    }

    update() {

    }

}
