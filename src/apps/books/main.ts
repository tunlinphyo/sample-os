import '../../style.css';
import './books.css';

import { HistoryStateManager } from '../../device/history.manager';
import { BooksStore } from '../../stores/books.store';
import { BooksApp } from './pages/app.page';
import { BooksController } from './books.controller';
import { BookReader } from './pages/book.reader';
import { BooksAppController } from './app.controller';
import { BookStorePage } from './pages/books.store';


document.body.dataset.schema = parent.device.theme;

document.addEventListener('DOMContentLoaded', () => {
    const historyManager = new HistoryStateManager();
    const bookStore = new BooksStore();
    const booksController = new BooksController(bookStore);

    new BooksApp(historyManager, booksController);
    const bookReader = new BookReader(historyManager, booksController, parent.device);
    const bookStorePage = new BookStorePage(historyManager);

    new BooksAppController(
        historyManager,
        parent.device,
        booksController,
        bookReader,
        bookStorePage
    );
});