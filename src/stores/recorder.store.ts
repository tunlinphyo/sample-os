import { DB } from "./db";
import { BaseManager, ChangeListener } from "./data";

export interface Audio {
    id: string;
    title: string;
    audio: string;
    createDate: Date;
    updateDate?: Date;
}

export class RecorderStore extends BaseManager<Audio> {
    private db: DB<Audio>;

    constructor() {
        super([])
        this.db = new DB<Audio>('recorder')
        this.init()
    }

    async init() {
        const items = await this.db.getAll()
        this.setItems(items)
        this.notifyListeners(null, 'loaded');
    }

    getId(contact: Audio): string {
        return contact.id;
    }

    setId(contact: Audio, id: string): Audio {
        return { ...contact, id };
    }

    async add(item: Audio) {
        item.createDate = new Date();
        const id = await this.db.post(item)
        this.addItem(id, item)
        return id
    }

    async update(id: string, item: Audio): Promise<string> {
        item.updateDate = new Date();
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

    listen(callback: ChangeListener<Audio>): void {
        this.addChangeListener((items, changedItem, operation) => {
            callback(items, changedItem, operation)
        })
    }
}
