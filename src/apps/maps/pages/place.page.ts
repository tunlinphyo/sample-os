import { Modal } from "../../../components/modal";
import { HistoryStateManager } from "../../../device/history.manager";
import { Place } from "../../../stores/maps.store";
import { MapsController } from "../maps.controller";

export interface Schedule {
    day: string;
    time: string;
}

export class PlacePage extends Modal {
    private place: google.maps.places.PlaceResult | undefined;
    private isSaved: boolean = false;
    private isFavourite: boolean = false;

    constructor(
        history: HistoryStateManager,
        private maps: MapsController
    ) {
        super(history, { btnStart: 'bookmark', btnEnd: 'favorite' });
        this.init();
    }

    private init() {
        this.addEventListener('click', () => {
            if (this.place) this.maps.toggleSavePlace(this.place);
        }, this.btnStart, false);

        this.addEventListener('click', () => {
            if (this.place) this.maps.toggleFavouritePlace(this.place);
        }, this.btnEnd, false);

        this.maps.addChangeListener((status: string, data: any) => {
            if (status === "PLACE_UPDATED") {
                this.update("update", data.place, data);
            }
        });
    }

    private toggleSaved() {
        const icon = this.getElement('.icon', this.btnStart);
        if (!icon) return;
        if (this.isSaved) icon.classList.add('fill-icon');
        else icon.classList.remove('fill-icon');
    }

    private toggleFavourite() {
        const icon = this.getElement('.icon', this.btnEnd);
        if (!icon) return;
        if (this.isFavourite) icon.classList.add('fill-icon');
        else icon.classList.remove('fill-icon');
    }

    render(data?: google.maps.places.PlaceResult) {
        if (!data) {
            const loadingContainer = this.createElement('div', ['loadingContainer']);
            const loader = this.createElement('div', ['loader']);

            loadingContainer.appendChild(loader);
            this.mainArea.appendChild(loadingContainer);
            return;
        };

        this.toggleSaved();
        this.toggleFavourite();

        this.place = data;

        // console.log(JSON.stringify(this.place));

        const scrollArea = this.createScrollArea();
        const contantArea = this.createElement('div', ['contantArea']);

        const titleEl = this.createElement('h2', ['title'])
        titleEl.textContent = this.place.name || '';
        contantArea.appendChild(titleEl);

        const openingStatus = this.createElement('div', ['openingStatus']);
        const openStatustext = this.getOpenStatusText(
            this.place.opening_hours,
            this.place.business_status,
            this.place.utc_offset_minutes || 0
        );
        openingStatus.textContent = openStatustext;
        contantArea.appendChild(openingStatus);

        if (this.place.formatted_address) {
            const address = this.createElement('div', ['openingStatus']);
            address.textContent = this.place.formatted_address;
            contantArea.appendChild(address);
        }

        if (this.place.formatted_phone_number) {
            const phoneEl = this.createElement('button', ['selectItem', 'withIcon'])
            phoneEl.innerHTML = `<span class="material-symbols-outlined">call</span> Call`
            this.addEventListener('click', () => {
                this.dispatchCustomEvent('onPhoneNumber', { contact: null, number: this.place!.formatted_phone_number })
            }, phoneEl)
            contantArea.appendChild(phoneEl)
        }

        if (this.place.website) {
            const websiteEl = this.createElement('button', ['selectItem', 'withIcon'])
            websiteEl.innerHTML = `<span class="material-symbols-outlined">globe</span> Website`
            // this.addEventListener('click', () => {
            //     this.dispatchCustomEvent('onPhoneNumber', { contact: null, number: this.place.formatted_phone_number })
            // }, phoneEl)
            contantArea.appendChild(websiteEl)

        }

        if (this.place.opening_hours?.weekday_text) {
            const result = this.parseSchedule(this.place.opening_hours?.weekday_text);
            // console.log(result);
            if (result.length) {
                const openingHours = this.createElement('button', ['selectItem', 'withIcon']);
                openingHours.innerHTML = `<span class="material-symbols-outlined">schedule</span> Opening Hours`;
                contantArea.appendChild(openingHours);

                this.addEventListener('click', () => {
                    this.history.pushState('/places/detail/openings', result);
                }, openingHours);
            }
        }

        const directionEl = this.createElement('button', ['selectItem', 'withIcon'])
        directionEl.innerHTML = `<span class="material-symbols-outlined">directions</span> Direction`
        this.addEventListener('click', () => {
            this.dispatchCustomEvent('onDirection', this.place)
        }, directionEl)
        contantArea.appendChild(directionEl)

        scrollArea.appendChild(contantArea);
        this.mainArea.appendChild(scrollArea);
    }

    update(_: string, data: google.maps.places.PlaceResult | null, place?: Place | null) {
        this.mainArea.innerHTML = '';
        this.removeAllEventListeners();
        // if (!this.isActive) return;
        if (place) {
            this.isSaved = place.isSaved;
            this.isFavourite = place.isFavourate;
            if (typeof place.place === 'string') {
                this.render(JSON.parse(place.place));
            } else {
                this.render(place.place);
            }
        } else if (data) {
            this.isSaved = false;
            this.isFavourite = false;
            this.render(data);
        }
    }

    private getOpenStatusText(openingHours: google.maps.places.PlaceOpeningHours | undefined, businessStatus: google.maps.places.BusinessStatus | undefined, utcOffsetMinutes: number): string {
        if (businessStatus === 'CLOSED_PERMANENTLY') {
            return 'Permanently closed';
        }

        if (!openingHours || !openingHours.periods) {
            return 'No opening hours available';
        }

        const now = new Date();
        const localTime = new Date(now.getTime() + (utcOffsetMinutes * 60000));
        const currentDay = localTime.getUTCDay();
        const currentTime = localTime.getUTCHours() * 60 + localTime.getUTCMinutes();

        const periods = openingHours.periods;

        for (let i = 0; i < 7; i++) {
            const dayIndex = (currentDay + i) % 7;
            const periodsForDay = periods.filter(period => period.open.day === dayIndex);

            for (let period of periodsForDay) {
                const openTime = period.open.hours * 60 + period.open.minutes;
                let closeTime = (period.close?.hours ?? 0) * 60 + (period.close?.minutes ?? 0);

                // Check if the place is open 24 hours
                if (openTime === 0 && (!period.close || (period.close.hours === 0 && period.close.minutes === 0))) {
                    return 'Open 24 hours';
                }

                // Handle the case where close time is after midnight
                if (closeTime < openTime) {
                    closeTime += 24 * 60;
                }

                // If it is currently open
                if (i === 0 && currentTime >= openTime && currentTime < closeTime) {
                    const closeHour = ((period.close?.hours || 0) % 12 || 12);
                    const closeMinute = (period.close?.minutes ?? 0).toString().padStart(2, '0');
                    const closePeriod = (period.close?.hours ?? 0) >= 12 ? 'PM' : 'AM';
                    return `Open • Closes at ${closeHour}:${closeMinute} ${closePeriod}`;
                }

                // If it is currently closed but will open later today or in the future
                if (currentTime < openTime || i > 0) {
                    const openHour = period.open.hours % 12 || 12;
                    const openMinute = period.open.minutes.toString().padStart(2, '0');
                    const openPeriod = period.open.hours >= 12 ? 'PM' : 'AM';
                    const daysFromToday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

                    if (i === 0) {
                        return `Closed • Opens today at ${openHour}:${openMinute} ${openPeriod}`;
                    } else {
                        return `Closed • Opens ${daysFromToday[dayIndex]} at ${openHour}:${openMinute} ${openPeriod}`;
                    }
                }
            }
        }

        return 'Closed';
    }

    private parseSchedule(schedule: string[]): Schedule[] {
        return schedule.map(entry => {
            const [day, time] = entry.split(": ");
            return { day, time };
        });
    }
}
