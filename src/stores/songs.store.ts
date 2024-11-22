import { DB } from "./db";
import { BaseManager, ChangeListener } from "./data";
import { Album } from "./album.store";
import { SONGS } from "../apps/music/service/music";
import { Artist } from "./artist.store";

export interface Song {
    id: string;
    title: string;
    music: string;
    artistIds: string[];
    artists?: Artist[];
    albumId: string;
    album?: Album;
    isFavourite: boolean;
}

export class SongStore extends BaseManager<Song> {
    private db: DB<Song>;

    constructor() {
        super([])
        this.db = new DB<Song>('song')
        this.init()
    }

    async init() {
        let items = await this.db.getAll();
        if (!items.length) {
            items = await this.db.postMany(SONGS);
        }
        this.setItems(items);
        this.notifyListeners(null, 'loaded');
    }

    getId(contact: Song): string {
        return contact.id;
    }

    setId(contact: Song, id: string): Song {
        return { ...contact, id };
    }

    public getAllByTitle(title: string): Song[] {
        return this.items.filter(item => item.title.toLowerCase().includes(title.toLowerCase()))
    }

    public getAllByAlbum(albumId: string): Song[] {
        return this.items.filter(item => item.albumId === albumId)
    }

    public getAllByArtist(artistId: string): Song[] {
        return this.items.filter(item => item.artistIds.includes(artistId))
    }

    async add(item: Song) {
        const id = await this.db.post(item)
        this.addItem(id, item)
        return id
    }

    async update(id: string, item: Song): Promise<string> {
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

    listen(callback: ChangeListener<Song>): void {
        this.addChangeListener((items, changedItem, operation) => {
            callback(items, changedItem, operation)
        })
    }
}
