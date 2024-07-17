import { Loader } from "@googlemaps/js-api-loader";
import { getStyles } from "./map.styles";

export interface LocationPosition {
    coords: {
        latitude: number;
        longitude: number;
    }
}

export class MapsService {
    private loader: Loader;

    private map: google.maps.Map | undefined;
    private marker: google.maps.Marker | undefined;
    private autocompleteService: google.maps.places.AutocompleteService | undefined;
    private placesService: google.maps.places.PlacesService | undefined;
    private currentLatLng: google.maps.LatLngLiteral | undefined;
    private zoom: number = 16;

    constructor() {
        this.loader = new Loader({
            apiKey: import.meta.env.VITE_MAPS_API_KEY,
            version: "weekly",
            libraries: ["places"]
        });
    }

    public async init(mapEl: HTMLElement, position: GeolocationPosition | LocationPosition) {
        const { latitude, longitude } = position.coords;
        this.currentLatLng = { lat: latitude, lng: longitude };

        const maps = await this.loader.importLibrary('maps')
        this.map = new maps.Map(mapEl, {
            zoom: this.zoom,
            center: this.currentLatLng,
            disableDefaultUI: true,
        });

        this.map.setOptions({
            styles: getStyles(),
        })

        const markers = await this.loader.importLibrary('marker')
        this.marker = new markers.Marker({
            position: this.currentLatLng,
            map: this.map,
            icon: {
                url: '/current-pos.svg',
                scaledSize: new google.maps.Size(32, 32)
            }
        });

        const places = await this.loader.importLibrary('places')
        this.autocompleteService = new places.AutocompleteService();
        this.placesService = new places.PlacesService(this.map);
    }

    public handleSearchChange(query: string): Promise<google.maps.places.AutocompletePrediction[]> {
        return new Promise((resolve) => {
            if (this.autocompleteService && query.length > 0) {
                const autocompleteRequest = {
                    input: query,
                    location: new google.maps.LatLng(this.currentLatLng!.lat, this.currentLatLng!.lng),
                    radius: 50
                };

                this.autocompleteService.getPlacePredictions(autocompleteRequest, async (predictions, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                        resolve(predictions);
                    }
                });
            }
        })
    };

    public fetchPlaceDetails(placeId: string): Promise<google.maps.places.PlaceResult | null> {
        const request = {
            placeId: placeId,
            fields: [
                'place_id', 'name', 'formatted_address', 'geometry', 'rating',
                'user_ratings_total', 'review', 'website', 'opening_hours',
                'formatted_phone_number', 'business_status', 'utc_offset_minutes'
            ]
        };

        return new Promise(resolve => {
            this.placesService!.getDetails(request, (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                    resolve(place);
                } else {
                    console.error('Failed to get place details:', status);
                    resolve(null);
                }
            });
        })
    }

    public async zoomToLevel(label?: number) {
        if (this.map) {
            const currentCenter = this.map.getCenter();
            if (currentCenter) {
                this.map.panTo(currentCenter);
                this.map.setZoom(label || this.zoom);
            }
        }
    }

    public centerOnCurrentLocation() {
        this.map!.setCenter(this.currentLatLng!);
        this.map!.setZoom(this.zoom);
        this.marker!.setPosition(this.currentLatLng);
    }

    public createPlaceMarker(place: google.maps.places.PlaceResult, callback: () => void) {
        if (!place.geometry || !place.geometry.location) return;

        const marker = new google.maps.Marker({
            map: this.map,
            position: place.geometry.location,
            title: place.name,
            icon: {
                url: `/marker.svg`,
                scaledSize: new google.maps.Size(32, 32),
                anchor: new google.maps.Point(16, 32)
            }
        });
        marker.addListener('click', callback);

        this.map!.panTo(place.geometry.location);
        this.map!.setZoom(this.zoom + 2);
    }
}