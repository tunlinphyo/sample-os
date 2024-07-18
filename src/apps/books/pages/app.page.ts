import { App } from "../../../components/app"
import { HistoryStateManager } from "../../../device/history.manager";
import { Book } from "../../../stores/books.store";
import { BooksController } from "../books.controller";


export class BooksApp extends App {
    constructor(
        history: HistoryStateManager,
        private book: BooksController
    ) {
        super(history, { btnEnd: 'more_horiz' });
        this.init();
    }

    private init() {
        this.book.addChangeListener((status: string) => {
            if (status === 'BOOKS_CHANGE') {
                this.update("update", this.book.books);
            }
        });
    }

    render(books: Book[]) {
        const scrollArea = this.createScrollArea();
        const bookList = this.createElement('ul', ['titleList']);
        for(const book of books) {
            const bookTitle = this.createElement('li', ['titleItem']);
            const titleEl = this.createElement('div', ['itemTitle']);
            titleEl.textContent = book.title;
            bookTitle.appendChild(titleEl);
            const authorEl = this.createElement('small', ['itemDate']);
            authorEl.textContent = book.author;
            bookTitle.appendChild(authorEl);
            this.addEventListener('click', () => {
                this.history.pushState('/books/reader', book.id);
            }, bookTitle)
            bookList.appendChild(bookTitle);
        }
        scrollArea.appendChild(bookList);
        this.mainArea.appendChild(scrollArea);
    }

    update(_: string, books: Book[]) {
        this.removeAllEventListeners();
        this.mainArea.innerHTML = "";
        this.render(books);
    }
}