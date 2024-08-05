import { BaseController } from "../../controllers/base.controller";
import { HistoryStateManager } from "../../device/history.manager";
import { MapsPlacesStore, Place } from "../../stores/maps.store";
import { ExploreData } from "./pages/explore.page";
import { MapsService } from "./services/maps.service";


export class MapsController extends BaseController {
    public service: MapsService;
    public places: Place[] = [];
    private _explore: ExploreData | undefined;

    constructor(
        private history: HistoryStateManager,
        private store: MapsPlacesStore
    ) {
        super();
        this.service = new MapsService();
        this.setupListeners();
    }

    get explore() {
        return this._explore || {
            searchData: '',
            places: []
        };
    }
    set explore(data: ExploreData) {
        this._explore = data;
    }

    private setupListeners() {
        this.store.listen((_, item) => {
            this.places = this.store.getAllPlaces();
            if (item) {
                this.notifyListeners('PLACE_UPDATED', item);
            }
        });
    }

    public initMap(mapEl: HTMLElement) {
        // this.service.init(mapEl, { coords: { latitude: 35.6895, longitude: 139.6917 }});
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (data) => {
                    this.service.init(mapEl, data)
                },
                () => {
                    this.service.init(mapEl, { coords: { latitude: 35.6895, longitude: 139.6917 }});
                }
            );
        } else {
            this.service.init(mapEl, { coords: { latitude: 35.6895, longitude: 139.6917 }});
            console.error('Geolocation not supported');
        }
    }

    public async fetchPlace(placeId: string) {
        const place = await this.service.fetchPlaceDetails(placeId);
        if (place) {
            this.service.createPlaceMarker(place, () => {
                this.history.pushState('/places/detail', JSON.stringify(place));
                this.savePlace(place);
            });
        }
    }

    public viewPlace(place: Place) {
        let mapPlace: google.maps.places.PlaceResult,
            jsonPlace: string;
        if (typeof place.place === 'string') {
            mapPlace = JSON.parse(place.place);
            jsonPlace = place.place;
        } else {
            mapPlace = place.place;
            jsonPlace = JSON.stringify(place.place)
        }
        this.service.createPlaceMarker(mapPlace, () => {
            this.history.pushState('/places/detail', jsonPlace);
            this.savePlace(mapPlace);
        });
    }

    public toggleSavePlace(place: google.maps.places.PlaceResult) {
        this.tryThis(async () => {
            await this.store.toggleSaved(place);
        });
    }

    public toggleFavouritePlace(place: google.maps.places.PlaceResult) {
        this.tryThis(async () => {
            await this.store.toggleFavourite(place);
        });
    }

    public savePlace(place: google.maps.places.PlaceResult) {
        if (!place.place_id) return;
        this.tryThis(async () => {
            const result = await this.store.savePlace(place);
            if (typeof result === 'object') {
                this.notifyListeners('PLACE_UPDATED', result);
            }
        });
    }

    public getPlace(place: google.maps.places.PlaceResult) {
        if (!place.place_id) return;
        this.tryThis(async () => {
            const result = await this.store.get(place.place_id!);
            if (result) {
                this.notifyListeners('PLACE_UPDATED', result);
                this.service.createPlaceMarker(place, () => {
                    this.history.pushState('/places/detail', JSON.stringify(place));
                    this.notifyListeners('PLACE_UPDATED', result);
                });
            }
        });
    }
}