import { Modal } from "../../../components/modal";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Book } from "../../../stores/books.store";
import { BooksController } from "../books.controller";
import { BookService } from "../services/book.service";

export class BookReader extends Modal {
    private bookService: BookService;

    private startX: number = 0;
    private currentX: number = 0;

    constructor(
        history: HistoryStateManager,
        private book: BooksController,
        private device: DeviceController
    ) {
        super(history, { template: 'readerTemplate', btnEnd: 'list' });

        this.bookService = new BookService(this.mainArea);
        this.touchEventListeners = this.touchEventListeners.bind(this);
        this.init();
        this.touchEventListeners();
    }

    private init() {
        this.addEventListener('click', async () => {
            const result = await this.device.selectList.openPage('Chapters', this.bookService.getChapters(), 'chapters');
            if (result) {
                this.bookService.chapter = parseInt(result);
                this.hideMenu();
            }
        }, this.btnEnd, false);

        this.listen('pageClose', () => {
            const book = this.bookService.getData();
            if (book) this.book.updateBook(book);
        })

        this.listen('pageCloseFinished', () => {
            this.hideMenu();
        });

        this.device.addEventListener('closeApp', () => {
            const book = this.bookService.getData();
            if (book) {
                this.book.updateBook(book);
                this.history.updateState('/books/reader', book.id);
            }
        });
    }

    private touchEventListeners() {
        this.component.addEventListener('touchstart', (event) => {
            this.startX = event.touches[0].clientX;
            this.currentX = event.touches[0].clientX;
        }, false);

        this.component.addEventListener('touchmove', (event) => {
            this.currentX = event.touches[0].clientX;
            const moveX = this.currentX - this.startX;
            this.bookService.moving(moveX);
        }, false);

        this.component.addEventListener('touchend', () => {
            const moveX = this.currentX - this.startX;
            this.bookService.moveEnd(moveX);
        }, false);

        this.component.addEventListener('mousedown', (event) => {
            this.startX = event.clientX;
            this.currentX = event.clientX;

            const onMouseMove = (moveEvent: MouseEvent) => {
                this.currentX = moveEvent.clientX;
                const moveX = this.currentX - this.startX;
                this.bookService.moving(moveX);
            };

            const onMouseUp = () => {
                const moveX = this.currentX - this.startX;
                if (moveX < 80 && moveX > -80) {
                    if (this.bookService.animating) return;
                    if (this.startX < 100) {
                        this.bookService.prev();
                        this.hideMenu();
                    } else if (this.startX < 240) {
                        this.toggleMenu()
                    } else {
                        this.bookService.next();
                        this.hideMenu();
                    }
                } else {
                    this.hideMenu();
                }
                this.bookService.moveEnd(moveX);
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }, false);
    }

    render(book: Book) {
        this.bookService.init(book);
    }

    update() {}

    private showMenu() {
        const parentEl = this.mainArea.parentElement!;
        if (!parentEl) return;
        parentEl.classList.remove('hidden');
    }

    private hideMenu() {
        const parentEl = this.mainArea.parentElement!;
        if (!parentEl) return;
        parentEl.classList.add('hidden');
    }

    private toggleMenu() {
        const parentEl = this.mainArea.parentElement!;
        if (!parentEl) return;
        if (parentEl.classList.contains('hidden')) {
            this.showMenu();
        } else {
            this.hideMenu();
        }
    }
}