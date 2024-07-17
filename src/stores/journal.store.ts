import { DB } from "./db";
import { BaseManager, ChangeListener } from './data';

export type JournalType = 'title' | 'paragraph' | 'quote' | 'order-list' | 'unorder-list'; // | 'check-list';

export interface JournalData {
    type: JournalType;
    data: string[];
}

export interface Journal {
    id: string;
    title: string;
    body: Array<JournalData>;
    createDate: Date;
    updateDate?: Date;
    deleted: boolean;
}

export interface GroupedJournal {
    date: string;
    notes: Journal[];
}

export class JournalStore extends BaseManager<Journal> {
    private db: DB<Journal>;

    constructor() {
        super([])
        this.db = new DB<Journal>('journal')
        this.init()
    }

    async init() {
        const items = await this.db.getAll()
        this.setItems(items)
        this.notifyListeners(null, 'loaded');
    }

    getId(contact: Journal): string {
        return contact.id;
    }

    setId(contact: Journal, id: string): Journal {
        return { ...contact, id };
    }

    getIds() {
        return this.items.map(item => {
            const date = item.createDate
            date.setHours(0, 0, 0, 0);
            return date
        });
    }

    getActiveDates(date: Date): Date[] {
        const activeDates: Set<string> = new Set();
        const year = date.getFullYear();
        const month = date.getMonth();

        this.items.forEach(note => {
            const noteDate = new Date(note.createDate);
            if (noteDate.getFullYear() === year && noteDate.getMonth() === month && !note.deleted) {
                noteDate.setHours(0, 0, 0, 0);
                activeDates.add(noteDate.toDateString());
            }
        });

        return Array.from(activeDates).map(dateString => new Date(dateString));
    }

    async add(item: Omit<Journal, 'id'>) {
        const customId = this.getIdFromDate(item.createDate);
        const id = await this.db.post(item, customId)
        this.addItem(id, item)
        return id
    }

    async update(id: string, item: Journal): Promise<string> {
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

    listen(callback: ChangeListener<Journal>): void {
        this.addChangeListener((items, changedItem, operation) => {
            callback(items, changedItem, operation)
        })
    }

    public getJournal(date: Date): Journal {
        const id = this.getIdFromDate(date);
        const item = this.items.find(item => item.id === id);
        if (item) return item;
        return {
            id: '',
            title: '',
            body: [
                { type: 'title', data: [] }
            ],
            createDate: date,
            deleted: false,
        }
    }

    private getIdFromDate(date: Date): string {
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        return `${year}-${month}-${day}`;
    }
}
