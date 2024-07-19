import { DeviceController } from "../../device/device";
import { HistoryState, HistoryStateManager } from "../../device/history.manager";
import { BooksController } from "./books.controller";
import { BookReader } from "./pages/book.reader";
import { BookStorePage } from './pages/books.store';

export class BooksAppController {
    constructor(
        private history: HistoryStateManager,
        private device: DeviceController,
        private book: BooksController,
        private bookReader: BookReader,
        private bookStorePage: BookStorePage
    ) {
        this.renderListeners();
    }

    private renderListeners() {
        const handleChange = (state: any, url: string) => {
            this.history.handleChange(url, [
                {
                    pattern: '/books/reader',
                    callback: () => {
                        const book = this.book.getBook(state);
                        if (book) {
                            this.bookReader.openPage(book.title, book);
                        }
                    }
                }, {
                    pattern: '/books/store',
                    callback: () => {
                        this.bookStorePage.openPage('Book Store');
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