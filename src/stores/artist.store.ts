import { DB } from "./db";
import { BaseManager, ChangeListener } from "./data";
import { ARTISTS } from "../apps/music/service/music";

export interface Artist {
    id: string;
    name: string;
    isFavourite: boolean;
}

export class ArtistStore extends BaseManager<Artist> {
    private db: DB<Artist>;

    constructor() {
        super([])
        this.db = new DB<Artist>('artist')
        this.init()
    }

    async init() {
        let items = await this.db.getAll();
        if (!items.length) {
            items = await this.db.postMany(ARTISTS);
        }
        this.setItems(items);
        this.notifyListeners(null, 'loaded');
    }

    getId(contact: Artist): string {
        return contact.id;
    }

    setId(contact: Artist, id: string): Artist {
        return { ...contact, id };
    }

    public getAllByName(name: string): Artist[] {
        return this.items.filter(item => item.name.toLowerCase().includes(name.toLowerCase()))
    }

    async add(item: Artist) {
        const id = await this.db.post(item)
        this.addItem(id, item)
        return id
    }

    async update(id: string, item: Artist): Promise<string> {
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

    listen(callback: ChangeListener<Artist>): void {
        this.addChangeListener((items, changedItem, operation) => {
            callback(items, changedItem, operation)
        })
    }
}
