import { DeviceController } from "../../device/device";
import { HistoryState, HistoryStateManager } from "../../device/history.manager";
import { BooksController } from "./books.controller";
import { BookStorePage } from './pages/books.store';
import { EBookReader } from "./pages/ebook.reader";

export class BooksAppController {
    constructor(
        private history: HistoryStateManager,
        private device: DeviceController,
        private book: BooksController,
        private bookStorePage: BookStorePage,
        private ebookReader: EBookReader
    ) {
        this.renderListeners();
    }

    private renderListeners() {
        const handleChange = (state: any, url: string) => {
            this.history.handleChange(url, [
                {
                    pattern: '/books/store',
                    callback: () => {
                        this.bookStorePage.openPage('Library', this.book.books);
                    }
                },
                {
                    pattern: '/books/reader',
                    callback: () => {
                        const book = this.book.getBook(state);
                        if (book) {
                            this.ebookReader.openPage(book.title, book);
                        }
                    }
                }
            ]);
        }

        this.history.onStateChange(handleChange);

        this.device.addEventListener('openAppFinished', () => {
            let history = parent.device.getHistory('books');
            if (!history) return;
            // console.log('OPEN_PAGE', history);
            this.history.init(history);
            history.forEach((item: HistoryState) => {
                handleChange(item.state, item.url);
            })
        })

        this.device.addEventListener('closeApp', () => {
            // console.log('CLOSE_PAGE', JSON.stringify(this.history.history));
            this.device.setHistory('books', this.history.history);
        });
    }
}