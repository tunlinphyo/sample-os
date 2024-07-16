import { DB } from "./db";
import { BaseManager, ChangeListener } from "./data";
// import { CurrentResponse } from "openweathermap-ts/dist/types";
import { LocationData } from "../utils/cities";

export const MY_LOCATION_ID = 'my-location';

export interface Weather {
    id: string;
    location: LocationData;
    weather: any;
}

export class WeatherStore extends BaseManager<Weather> {
    private db: DB<Weather>;

    constructor() {
        super([])
        this.db = new DB<Weather>('weather')
        this.init()
    }

    async init() {
        const items = await this.db.getAll()
        this.setItems(items);
        const item = items.find(i => i.id === 'my-location');
        if (item) {
            this.notifyListeners(item, 'loaded');
        }
    }

    getId(contact: Weather): string {
        return contact.id;
    }

    setId(contact: Weather, id: string): Weather {
        return { ...contact, id };
    }

    async add(item: Omit<Weather, 'id'>, itemId?: string) {
        const id = await this.db.post(item, itemId)
        this.addItem(id, item)
        return id
    }

    async update(id: string, item: Omit<Weather, 'id'>): Promise<string> {
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

    listen(callback: ChangeListener<Weather>): void {
        this.addChangeListener((items, changedItem, operation) => {
            callback(items, changedItem, operation)
        })
    }
}