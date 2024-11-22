import { DB } from "./db";
import { BaseManager, ChangeListener } from "./data";
import { ALBUMS } from "../apps/music/service/music";
import { Artist } from "./artist.store";

export interface Album {
    id: string;
    name: string;
    cover: string;
    releaseDate: Date;
    artistIds: string[];
    artists?: Artist[];
    isFavourite: boolean;
}

export class AlbumStore extends BaseManager<Album> {
    private db: DB<Album>;

    constructor() {
        super([])
        this.db = new DB<Album>('album')
        this.init()
    }

    async init() {
        let items = await this.db.getAll();
        if (!items.length) {
            items = await this.db.postMany(ALBUMS);
        }
        this.setItems(items);
        this.notifyListeners(null, 'loaded');
    }

    getId(contact: Album): string {
        return contact.id;
    }

    setId(contact: Album, id: string): Album {
        return { ...contact, id };
    }

    public getAllByName(name: string): Album[] {
        return this.items.filter(item => item.name.toLowerCase().includes(name.toLowerCase()))
    }

    public getAllByArtist(artistId: string): Album[] {
        return this.items.filter(item => item.artistIds.includes(artistId))
    }

    async add(item: Album) {
        const id = await this.db.post(item)
        this.addItem(id, item)
        return id
    }

    async update(id: string, item: Album): Promise<string> {
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

    listen(callback: ChangeListener<Album>): void {
        this.addChangeListener((items, changedItem, operation) => {
            callback(items, changedItem, operation)
        })
    }
}
