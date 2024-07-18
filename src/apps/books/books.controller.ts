import { BaseController } from "../../controllers/base.controller";
import { Book, BooksStore } from "../../stores/books.store";


export class BooksController extends BaseController {
    private _books: Book[] = [];

    constructor(private store: BooksStore) {
        super();
        this.setupListeners();
    }

    get books() {
        return this._books;
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

    updateBook(data: Book) {
        this.tryThis(async () => {
            await this.store.update(data.id, data);
        })
    }
}