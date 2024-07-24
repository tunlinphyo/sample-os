import { App } from "../../../components/app"
import { HistoryStateManager } from "../../../device/history.manager";
import { Book } from "../../../stores/books.store";
import { BooksController } from "../books.controller";


export class BooksApp extends App {
    constructor(
        history: HistoryStateManager,
        private book: BooksController
    ) {
        super(history, { template: 'actionTemplate', btnEnd: 'shopping_bag' });
        this.component.classList.add('booksPage');
        this.init();
    }

    private init() {
        this.addEventListener('click', () => {
            this.history.pushState('/books/store', null);
        }, this.btnEnd, false);

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
            // const bookHeight = Math.max(Math.round(book.totalPages / 200 * 100), 50);
            const minHeight = Math.max(Math.round(book.totalPages * 0.5), 60);
            const bookHeight = Math.min(minHeight, 120);
            const bookTitle = this.createElement('li', ['bookItem'], { style: `height: ${bookHeight}px` });

            const titleEl = this.createElement('div', ['bookTitle']);
            if (bookHeight < 90) {
                titleEl.classList.add('oneLine');
            }
            titleEl.textContent = book.title;

            // const authorEl = this.createElement('small', ['bookAuthor']);
            // authorEl.textContent = book.author;

            // const bookSize = Math.min(Math.round(book.totalPages / 350 * 100), 100);
            const readingProgress =  Math.round(book.currantPage / book.totalPages * 100);

            const progressContainerEl = this.createElement('div', ['progressContainer']);
            const progressEl = this.createElement('div', ['progress'], { style: `height: ${readingProgress}%;` });
            progressContainerEl.appendChild(progressEl);

            bookTitle.appendChild(titleEl);
            // bookTitle.appendChild(authorEl);
            bookTitle.appendChild(progressContainerEl);

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