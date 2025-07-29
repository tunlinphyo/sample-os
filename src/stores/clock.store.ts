import { DB } from "./db";
import { BaseManager, ChangeListener } from './data';

export interface StopWatchData {
    id: string;
    startTime: number | null;
    stopTime: number | null;
    running: boolean;
    laps: number[];
    timerInterval: NodeJS.Timeout | number | null;
}

export interface TimerData {
    id: string;
    duration: number;
    remainingTime: number;
    timerId: number | null;
    endTime: number | null;
    running: boolean;
}

export type ClockData = StopWatchData | TimerData;

export class ClockStore extends BaseManager<ClockData> {
    private db: DB<ClockData>;

    constructor() {
        super([])
        this.db = new DB<ClockData>('clock')
        this.init()
    }

    async init() {
        const items = await this.db.getAll();
        this.setItems(items);
        if (!this.get('countdown')) {
            const duration = 3 * 60 * 1000;
            this.add({
                id: 'countdown',
                duration,
                remainingTime: duration,
                timerId: null,
                endTime: Date.now() + duration,
                running: false
            }, 'countdown');
        }
        this.notifyListeners(null, 'loaded');
    }

    getId(contact: ClockData): string {
        return contact.id;
    }

    setId(contact: ClockData, id: string): ClockData {
        return { ...contact, id };
    }

    async add(item: ClockData, id?: string) {
        const dbid = await this.db.post(item, id)
        this.addItem(dbid, item)
        return dbid
    }

    async update(id: string, item: ClockData): Promise<string> {
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

    listen(callback: ChangeListener<ClockData>): void {
        this.addChangeListener((items, changedItem, operation) => {
            callback(items, changedItem, operation)
        })
    }
}
