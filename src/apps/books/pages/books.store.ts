import { Page } from "../../../components/page";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { EPUBParser } from "../../../services/ebook.parser";
import { EpubUploader } from "../services/book.uploader";
import { BooksController } from "../books.controller";
import { Book } from "../../../stores/books.store";
import { OSNumber } from "../../../utils/number";
import { ScrollBar } from "../../../components/scroll-bar";

export class BookStorePage extends Page {
    private uploadEl: HTMLInputElement;

    constructor(
        history: HistoryStateManager,
        private book: BooksController,
        private device: DeviceController
    ) {
        super(history, { btnStart: 'filter_list', btnEnd: 'add' });
        this.component.classList.add('storePage');
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
    }

    render(books: Book[]) {
        const scrollArea = this.createScrollArea();
        const bookList = this.createElement('ul', ['titleList']);
        for(const book of books) {
            const bookHeight = OSNumber.clamp(Math.round(book.totalPages * 0.1), [32, 140]);
            const bookTitle = this.createElement('li', ['bookItem'], { style: `height: ${bookHeight}px` });

            const titleEl = this.createElement('div', ['bookTitle']);
            if (bookHeight < 40) {
                titleEl.classList.add('smallText');
            }
            if (bookHeight < 90) {
                titleEl.classList.add('oneLine');
            }

            titleEl.innerHTML = `<span>${book.title}</span>`;
            titleEl.style.fontSize = `${OSNumber.mapRange(bookHeight, 50, 140, 18, 24)}px`;

            const length = OSNumber.clamp(book.title.length, [10, 35]);
            const width = OSNumber.mapRange(length, 10, 30, 80, 100);
            bookTitle.style.width = `${OSNumber.clamp(width, [80, 100])}%`;

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

    update() {}

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
        await this.book.addBook(bookData);
        close();
    }

}