import { App } from "../../../components/app"
import { ScrollBar } from "../../../components/scroll-bar";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { EPUBParser } from "../../../services/ebook.parcer";
import { Book } from "../../../stores/books.store";
import { BooksController } from "../books.controller";
import { EpubUploader } from "../services/book.uploader";


export class BooksApp extends App {
    private uploadEl: HTMLInputElement;
    
    constructor(
        history: HistoryStateManager,
        private book: BooksController,
        private device: DeviceController
    ) {
        super(history, { template: 'actionTemplate', btnEnd: 'upload' });
        this.component.classList.add('booksPage');
        this.uploadEl = this.createElement<HTMLInputElement>('input', [], {
            type: 'file',
            accept: '.epub'
        });
        this.init();
    }

    private init() {
        new EpubUploader(
            this.uploadEl, 
            (error: Error) => {
                this.device.alertPopup.openPage('Error', error.message);
            },
            (file: File) => {
                this.extractEpubFromUrl(file);
            }
        );

        this.addEventListener('click', () => {
            this.uploadEl.click();
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
            const minHeight = Math.max(Math.round(book.totalPages * 0.1), 40);
            const bookHeight = Math.min(minHeight, 120);
            const bookTitle = this.createElement('li', ['bookItem'], { style: `height: ${bookHeight}px` });
            if (bookHeight < 60) {
                bookTitle.classList.add('no-wrap');
            }

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
        new ScrollBar(this.component);
    }

    update(_: string, books: Book[]) {
        this.removeAllEventListeners();
        this.mainArea.innerHTML = "";
        this.render(books);
    }

    public async extractEpubFromUrl(file: File) {
        const [ close, update ] = await this.device.loadingPopup.openPage('Loading', 'Uploading...');
        const parser = new EPUBParser(file);
        const epubData = await parser.parse().catch((error: Error) => {
            close();
            this.device.alertPopup.openPage('Error', error.message);
        });

        await update('Processiong...');
        console.log(epubData);
        console.log(this.mainArea.parentElement);
        const bookData = EPUBParser.getData(this.mainArea.parentElement as HTMLElement, epubData);
        await update('Saving...');
        console.log(bookData);
        this.book.addBook(bookData);
        close();
    }

}