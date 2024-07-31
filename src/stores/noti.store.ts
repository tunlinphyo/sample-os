import { DB } from "./db";
import { BaseManager, ChangeListener } from './data';
import { HistoryState } from "../device/history.manager";

export interface NotiType {
    id: string;
    app: string;
    history: HistoryState[];
    data: any;
}

export class ClockNotiTypeStore extends BaseManager<NotiType> {
    private db: DB<NotiType>;

    constructor() {
        super([])
        this.db = new DB<NotiType>('alarms')
        this.init()
    }

    async init() {
        const items = await this.db.getAll()
        this.setItems(items)
        this.notifyListeners(null, 'loaded');
    }

    ready() {
        this.notifyListeners(null, 'apploaded');
    }

    getId(contact: NotiType): string {
        return contact.id;
    }

    setId(contact: NotiType, id: string): NotiType {
        return { ...contact, id };
    }

    async add(item: NotiType) {
        const id = await this.db.post(item)
        this.addItem(id, item)
        return id
    }

    async update(id: string, item: NotiType): Promise<string> {
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

    listen(callback: ChangeListener<NotiType>): void {
        this.addChangeListener((items, changedItem, operation) => {
            callback(items, changedItem, operation)
        })
    }
}
