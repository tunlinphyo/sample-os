import { Keyboard } from "../../../components/keyboard";
import { Modal } from "../../../components/modal";
import { ScrollBar } from "../../../components/scroll-bar";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { MapsController } from "../maps.controller";

export interface ExploreData {
    searchData: string;
    places?: google.maps.places.AutocompletePrediction[];
}

export class ExplorePage extends Modal {
    private scrollBar?: ScrollBar;
    private searchData: string = '';
    private places: google.maps.places.AutocompletePrediction[] = [];

    constructor(
        history: HistoryStateManager,
        private maps: MapsController,
        private device: DeviceController
    ) {
        super(history, { template: 'actionTemplate' });
        this.component.classList.add("explorePage");
        this.init = this.init.bind(this);
        this.init();
    }

    private init() {
        this.device.keyboard.listen('keyboardCloseFinished', () => {
            if (!this.searchData) this.closePage();
        })
    }

    render(data: ExploreData) {
        if (data.places) this.places = data.places;
        const searchContainer = this.createElement('div', ['searchBarContainer']);
        const searchEl = this.createElement('div', ['searchBar']);

        const searchIcon = this.createElement('span', ['material-symbols-outlined', 'pointerNone']);
        searchIcon.textContent = 'search';
        searchEl.appendChild(searchIcon);

        const searchInput = this.createElement('span', ['searchInput', 'pointerNone']);
        searchInput.textContent = data.searchData;
        searchEl.appendChild(searchInput);

        const closeIcon = this.createElement('span', ['material-symbols-outlined', 'cursorPointer', this.searchData ? 'show' : 'hide']);
        closeIcon.textContent = 'close';
        searchEl.appendChild(closeIcon);

        if (!data.searchData) {
            this.keyboardOpen(searchInput);
        }

        this.addEventListener('click', () =>{
            this.update('', { searchData: '', places: [] });
        }, closeIcon)

        this.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            if (target === searchEl) {
                this.keyboardOpen(searchInput);
            }
        }, searchEl);

        searchContainer.appendChild(searchEl);
        this.mainArea.appendChild(searchContainer);

        const placeList = this.createElement('div', ['placeList']);

        // console.log('PLACES', places);
        this.places.forEach(place => {
            const placeEl = this.createElement('button', ['place']);
            placeEl.innerHTML = `
                <span class="material-symbols-outlined placeIcon">distance</span>
                <span class="detail">
                    ${place.structured_formatting.main_text}
                    <small>${place.structured_formatting.secondary_text || ''}</small>
                </span>
            `;
            placeList.appendChild(placeEl);
            this.addEventListener('click', () => {
                if (place.place_id) {
                    this.maps.fetchPlace(place.place_id);
                    this.closePage();
                }
            }, placeEl);
        });

        this.mainArea.appendChild(placeList);

        setTimeout(() => {
            if (!this.scrollBar) {
                this.scrollBar = new ScrollBar(this.component);
            } else {
                this.scrollBar?.reCalculate();
            }
        }, 100)
    }

    update(_: string, data: ExploreData) {
        this.mainArea.innerHTML = '';
        this.removeAllEventListeners();
        this.render(data)
    }

    private keyboardOpen(searchInput: HTMLElement) {
        const keyboard: Keyboard = {
            label: 'Search',
            defaultValue: searchInput.textContent || '',
            type: 'text',
            btnEnd: 'check',
        }
        this.device.keyboard.open(keyboard).then(data => {
            searchInput.textContent = data;
            this.onSearch(data);
        });
    }

    private async onSearch(data: string) {
        this.searchData = data;
        const places = await this.maps.service.handleSearchChange(data);
        const explore = { searchData: data, places };
        this.maps.explore = explore;
        this.history.replaceState('/explore', explore);
        this.update('', explore);
    }
}
