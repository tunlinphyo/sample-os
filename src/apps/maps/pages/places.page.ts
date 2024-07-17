import { Modal } from "../../../components/modal";
import { HistoryStateManager } from "../../../device/history.manager";
import { Place } from "../../../stores/maps.store";
import { MapsController } from "../maps.controller";

export class PlacesPage extends Modal {
    constructor(
        history: HistoryStateManager,
        private maps: MapsController
    ) {
        super(history, { template: 'actionTemplate' });
    }

    render(data: Place[]) {
        console.log(data);
        const placeList = this.createElement('div', ['placeList']);

        for(const item of this.sortByName(data)) {
            const place = item.place as google.maps.places.PlaceResult;
            const placeEl = this.createElement('button', ['place']);
            const icon = item.isFavourate ? 'favorite' : 'bookmark';
            placeEl.innerHTML = `
                <span class="material-symbols-outlined fill-icon">${icon}</span>
                <span class="detail">
                    ${place.name}
                    <small>${place.formatted_address}</span>
                </span>
            `;
            this.addEventListener('click', () => {
                this.maps.viewPlace(item);
                this.closePage();
            }, placeEl);
            placeList.appendChild(placeEl);
        }

        this.mainArea.appendChild(placeList);
    }

    update(_: string, data: Place[]) {
        this.mainArea.innerHTML = '';
        this.removeAllEventListeners();
        this.render(data);
    }

    private sortByName(data: Place[]) {
        return data.sort((a, b) => {
            const aPlace = a.place as google.maps.places.PlaceResult;
            const bPlace = b.place as google.maps.places.PlaceResult;
            return (aPlace.name || '').localeCompare((bPlace.name || ''));
        });
    }
}
