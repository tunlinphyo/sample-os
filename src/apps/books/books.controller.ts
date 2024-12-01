import { BaseController } from "../../controllers/base.controller";
import { Book, BooksStore } from "../../stores/books.store";


export class BooksController extends BaseController {
    private _books: Book[] = [];

    constructor(private store: BooksStore) {
        super();
        this.setupListeners();
    }

    get books() {
        return this._books.sort((a, b) => {
            if (!a.lastReadDate) return 1;
            if (!b.lastReadDate) return -1;
            return b.lastReadDate.getTime() - a.lastReadDate.getTime();
        });
    }

    private setupListeners() {
        this.store.listen((list) => {
            this._books = list;
            this.notifyListeners('BOOKS_CHANGE', list);
        });
    }

    getBook(id: string) {
        return this.store.get(id);
    }

    async addBook(data: Book) {
        try {
            await this.store.add(data);
            return true;
        } catch(error) {
            return false;
        }
        return this.tryThis(async () => {
        });
    }

    updateBook(data: Book) {
        this.tryThis(async () => {
            await this.store.update(data.id, data);
        })
    }
}