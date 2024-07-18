import { DB } from "./db";
import { BaseManager, ChangeListener } from "./data";
import { BOOKS } from "../apps/books/services/books";

export interface Chapter {
    index: number;
    title: string;
    pageNumber: number;
}

export interface Book {
    id: string;
    title: string;
    author: string;
    chapters: Chapter[];
    totalPages: number;
    bookmarks: number[];
    currantPage: number;
    lastReadDate?: Date;
}

export class BooksStore extends BaseManager<Book> {
    private db: DB<Book>;

    constructor() {
        super([])
        this.db = new DB<Book>('books')
        this.init()
    }

    async init() {
        let items = await this.db.getAll();
        if (!items.length) {
            items = await this.db.postMany(BOOKS);
        }
        this.setItems(items);
        this.notifyListeners(null, 'loaded');
    }

    getId(contact: Book): string {
        return contact.id;
    }

    setId(contact: Book, id: string): Book {
        return { ...contact, id };
    }

    async add(item: Book) {
        const id = await this.db.post(item)
        this.addItem(id, item)
        return id
    }

    async update(id: string, item: Book): Promise<string> {
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

    listen(callback: ChangeListener<Book>): void {
        this.addChangeListener((items, changedItem, operation) => {
            callback(items, changedItem, operation)
        })
    }
}
