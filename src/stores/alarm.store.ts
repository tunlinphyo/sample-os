import { DB } from "./db";
import { BaseManager, ChangeListener } from './data';

export type RepeatOption = 0 | 1 | 2| 3| 4 | 5 | 6;

export interface Alarm {
    id: string;
    time: Date;
    label: string;
    repeat: RepeatOption[];
    active: boolean;
}

export class ClockAlarmStore extends BaseManager<Alarm> {
    private db: DB<Alarm>;

    constructor() {
        super([])
        this.db = new DB<Alarm>('alarms')
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

    getId(contact: Alarm): string {
        return contact.id;
    }

    setId(contact: Alarm, id: string): Alarm {
        return { ...contact, id };
    }

    async add(item: Alarm) {
        const id = await this.db.post(item)
        this.addItem(id, item)
        return id
    }

    async update(id: string, item: Alarm): Promise<string> {
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

    listen(callback: ChangeListener<Alarm>): void {
        this.addChangeListener((items, changedItem, operation) => {
            callback(items, changedItem, operation)
        })
    }
}
