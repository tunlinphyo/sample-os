import { DB } from "./db";
import { BaseManager, ChangeListener } from './data';
import { HistoryState } from "../device/history.manager";

export interface Noti {
    id: string;
    app: string;
    history: HistoryState[];
    data: any;
}

export class NotificationStore extends BaseManager<Noti> {
    private db: DB<Noti>;

    constructor() {
        super([])
        this.db = new DB<Noti>('notification')
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

    getId(contact: Noti): string {
        return contact.id;
    }

    setId(contact: Noti, id: string): Noti {
        return { ...contact, id };
    }

    async add(item: Omit<Noti, "id">, uuid: string) {
        const id = await this.db.post(item, uuid)
        this.addItem(id, item)
        return id
    }

    async update(id: string, item: Omit<Noti, "id">): Promise<string> {
        await this.db.put(id, item)
        this.editItem(id, item)
        return id
    }

    async del(id: string): Promise<string> {
        const data = this.items.find(item => item.id === id);
        if (!data) return "";
        await this.db.del(id)
        this.deleteItem(id)
        return id
    }

    public resetStore() {
        return this.db.clear();
    }

    addNoti(id: string, noti: Omit<Noti, "id">) {
        const data = this.items.find(item => item.id === id);
        if (data) this.update(id, noti);
        else this.add(noti, id);
    }

    listen(callback: ChangeListener<Noti>): void {
        this.addChangeListener((items, changedItem, operation) => {
            callback(items, changedItem, operation)
        })
    }
}
