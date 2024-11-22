import { DB } from "./db";
import { BaseManager, ChangeListener } from "./data";

export type MusicType = 'player' | 'playing' | 'history' | 'favourite-songs' | 'favourite-artist' | 'favourite-album';
export type PlayerMeta = 'default' | 'loop' | 'loop-1';

export interface Music {
    id: string;
    type: MusicType;
    data: string[];
    meta: any | PlayerMeta;
}

export class MusicStore extends BaseManager<Music> {
    private db: DB<Music>;

    constructor() {
        super([])
        this.db = new DB<Music>('music')
        this.init()
    }

    async init() {
        let items = await this.db.getAll();
        if (!items.length) {
            items = await this.db.postMany([{
                id: '672e6b33-d8e7-4c9f-ab3f-94da0307eed2',
                type: 'player',
                data: [],
                meta: 'default'
            }]);
        }
        this.setItems(items);
        this.notifyListeners(null, 'loaded');
    }

    getId(contact: Music): string {
        return contact.id;
    }

    setId(contact: Music, id: string): Music {
        return { ...contact, id };
    }

    public getByType(type: MusicType): Music[] {
        return this.items.filter(item => item.type === type)
    }

    async add(item: Music) {
        const id = await this.db.post(item)
        this.addItem(id, item)
        return id
    }

    async update(id: string, item: Music): Promise<string> {
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

    listen(callback: ChangeListener<Music>): void {
        this.addChangeListener((items, changedItem, operation) => {
            callback(items, changedItem, operation)
        })
    }
}
