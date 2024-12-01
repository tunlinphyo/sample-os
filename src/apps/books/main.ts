import '../../style.css';
import './books.css';

import { HistoryStateManager } from '../../device/history.manager';
import { BooksStore } from '../../stores/books.store';
import { BooksApp } from './pages/app.page';
import { BooksController } from './books.controller';
import { BooksAppController } from './app.controller';
import { BookStorePage } from './pages/books.store';
import { EBookReader } from './pages/ebook.reader';


document.body.dataset.schema = parent.device.theme;

document.addEventListener('DOMContentLoaded', () => {
    const historyManager = new HistoryStateManager();
    const bookStore = new BooksStore();
    const booksController = new BooksController(bookStore);

    new BooksApp(historyManager, booksController, parent.device);
    const bookStorePage = new BookStorePage(historyManager);
    const ebookReader = new EBookReader(historyManager, booksController, parent.device);

    new BooksAppController(
        historyManager,
        parent.device,
        booksController,
        bookStorePage,
        ebookReader
    );
});