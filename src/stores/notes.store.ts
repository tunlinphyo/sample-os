import { DB } from "./db";
import { BaseManager, ChangeListener } from "./data";

export type NoteType = 'title' | 'paragraph' | 'quote' | 'order-list' | 'unorder-list'; // | 'check-list';

export interface NoteData {
    type: NoteType;
    data: string[];
}

export interface NoteBase {
    id: string;
    title: string;
    createDate: Date;
    updateDate?: Date;
    deleted: boolean;
  }
  
export interface TextNote extends NoteBase {
    type: 'note';
    body: Array<NoteData>;
}
  
export interface AudioNote extends NoteBase {
    type: 'audio';
    body: string;
}
  
export type Note = TextNote | AudioNote;

export class NotesStore extends BaseManager<Note> {
    private db: DB<Note>;

    constructor() {
        super([])
        this.db = new DB<Note>('notes')
        this.init()
    }

    async init() {
        const items = await this.db.getAll()
        this.setItems(items)
        this.notifyListeners(null, 'loaded');
    }

    getId(contact: Note): string {
        return contact.id;
    }

    setId(contact: Note, id: string): Note {
        return { ...contact, id };
    }

    async add(item: Note) {
        item.createDate = new Date();
        const id = await this.db.post(item)
        this.addItem(id, item)
        return id
    }

    async update(id: string, item: Note): Promise<string> {
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

    listen(callback: ChangeListener<Note>): void {
        this.addChangeListener((items, changedItem, operation) => {
            callback(items, changedItem, operation)
        })
    }

    // public toogleChecklist(note: Note, dataId: string, checkId) {
        // note.body = note.body.map(item => {
        //     if (item.id === dataId && item.type === 'check-list') {
        //         return {
        //             ...item,
        //             data: item.data.map(check => {
        //                 if (check.id === checkId) return { ...check, checked: !check.checked };
        //                 return check;
        //             })
        //         }
        //     } else {
        //         return item;
        //     }
        // });

        // return note;
    // }
}
