import { DB } from "./db";
import { BaseManager, ChangeListener } from "./data";

export interface Place {
    id: string;
    place: google.maps.places.PlaceResult | string;
    isFavourate: boolean;
    isSaved: boolean;
}

export class MapsPlacesStore extends BaseManager<Place> {
    private db: DB<Place>;

    constructor() {
        super([])
        this.db = new DB<Place>('places')
        this.init()
    }

    async init() {
        const items = await this.db.getAll()
        this.setItems(items)
        this.notifyListeners(null, 'loaded');
    }

    getId(contact: Place): string {
        return contact.id;
    }

    setId(contact: Place, id: string): Place {
        return { ...contact, id };
    }

    public async savePlace(place: google.maps.places.PlaceResult) {
        const exist = this.get(place.place_id as string);
        if (exist) return exist;

        return this.add({
            place,
            isSaved: false,
            isFavourate: false,
        }, place.place_id)
    }

    public async toggleSaved(place: google.maps.places.PlaceResult) {
        const exist = this.get(place.place_id as string);
        if (exist) {
            return this.update(exist.id, { ...exist, isSaved: !exist.isSaved });
        } else {
            return this.add({
                place,
                isSaved: true,
                isFavourate: false,
            }, place.place_id)
        }
    }

    public async toggleFavourite(place: google.maps.places.PlaceResult) {
        const exist = this.get(place.place_id as string);
        if (exist) {
            return this.update(exist.id, { ...exist, isFavourate: !exist.isFavourate });
        } else {
            return this.add({
                place,
                isSaved: false,
                isFavourate: true,
            }, place.place_id)
        }
    }

    async add(item: Omit<Place, 'id'>, itemId?: string) {
        item.place = JSON.stringify(item.place);
        const id = await this.db.post(item, itemId)
        this.addItem(id, item)
        return id
    }

    async update(id: string, item: Place): Promise<string> {
        await this.db.put(id, item)
        this.editItem(id, item)
        return id
    }

    async del(id: string): Promise<string> {
        await this.db.del(id)
        this.deleteItem(id)
        return id
    }

    public resetStore() {
        return this.db.clear();
    }

    listen(callback: ChangeListener<Place>): void {
        this.addChangeListener((items, changedItem, operation) => {
            callback(items, changedItem, operation)
        })
    }

    getAllPlaces() {
        const places = this.items.filter(item => (item.isFavourate || item.isSaved));
        return places.map(item => {
            if (typeof item.place === 'string') {
                item.place = JSON.parse(item.place);
            }
            return item;
        });
    }
}