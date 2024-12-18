import { Modal } from "../../../components/modal";
import { SelectItem } from "../../../components/select";
import { DeviceController, DeviceTheme } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Book } from "../../../stores/books.store";
import { BooksController } from "../books.controller";
import { EBookService } from "../services/ebook.service";

export class EBookReader extends Modal {
    private bookService: EBookService;
    private bookThemeEl: HTMLButtonElement;
    private bookmarkEl: HTMLButtonElement;

    private startX: number = 0;
    private startY: number = 0;
    private currentX: number = 0;
    private textSelected: boolean = false;

    constructor(
        history: HistoryStateManager,
        private book: BooksController,
        private device: DeviceController
    ) {
        super(history, { template: 'readerTemplate' });

        this.bookService = new EBookService(this.mainArea);
        this.bookThemeEl = this.getElement(".bookTheme");
        this.bookmarkEl = this.getElement(".bookmark");
        this.btnStart = this.getElement<HTMLButtonElement>(".bookmarks");
        this.btnEnd = this.getElement<HTMLButtonElement>(".contents");
        this.touchEventListeners = this.touchEventListeners.bind(this);
        this.init();
        this.touchEventListeners();
    }

    private init() {
        this.addEventListener('click', async () => {
            const result = await this.device.selectList.openPage('Bookmarks', this.bookService.getBookmarks(), 'bookmarks');
            if (result && typeof result === 'string') {
                this.bookService.chapter = parseInt(result);
                this.hideMenu();
            }
        }, this.btnStart, false);

        this.addEventListener('click', async () => {
            const result = await this.device.selectList.openPage('Chapters', this.bookService.getChapters(), 'chapters');
            if (result && typeof result === 'string') {
                this.bookService.chapter = parseInt(result);
                this.hideMenu();
            }
        }, this.btnEnd, false);

        this.addEventListener('click', () => {
            this.bookService.toggleBookmark();
            this.hideMenu();
        }, this.bookmarkEl, false);


        this.addEventListener('click', async () => {
            const list: SelectItem[] = [
                {
                    title: 'Auto',
                    value: 'auto',
                    icon: 'contrast'
                },
                {
                    title: 'Light',
                    value: 'light',
                    icon: 'light_mode'
                },
                {
                    title: 'Dark',
                    value: 'dark',
                    icon: 'dark_mode'
                },
            ];
            const selected = await this.device.selectList.openPage<DeviceTheme>('Appearence', list);
            if (selected && typeof selected === 'string') {
                this.bookService.theme = selected;
                if (selected === 'auto') {
                    this.device.tempTheme = this.device.theme;
                    document.body.dataset.schema = this.device.theme;
                } else {
                    this.device.tempTheme = selected;
                    document.body.dataset.schema = selected;
                }
                this.updateIcon(this.bookService.theme);
            }
        }, this.bookThemeEl, false);

        this.listen('pageClose', () => {
            this.device.tempTheme = this.device.theme;
            document.body.dataset.schema = this.device.theme;
            const book = this.bookService.getData();
            if (book) this.book.updateBook(book);
        })

        this.listen('pageCloseFinished', () => {
            this.hideMenu(false);
        });

        this.device.addEventListener('closeApp', () => {
            this.device.tempTheme = this.device.theme;
            const book = this.bookService.getData();
            if (book) {
                this.book.updateBook(book);
                this.history.updateState('/books/reader', book.id);
            }
        });
    }

    private touchEventListeners() {
        this.mainArea.addEventListener('touchstart', (event) => {
            this.startX = event.touches[0].clientX;
            this.startY = event.touches[0].clientY;
            this.currentX = event.touches[0].clientX;
        }, false);

        this.mainArea.addEventListener('touchmove', (event) => {
            event.preventDefault();
            this.currentX = event.touches[0].clientX;
            if (!this.textSelected) {
                const moveX = this.currentX - this.startX;
                this.bookService.moving(moveX);
            }
        }, false);

        this.mainArea.addEventListener('touchend', () => {
            const moveX = this.currentX - this.startX;
            if (!this.textSelected) {
                this.bookService.moveEnd(moveX);
            }
        }, false);

        // document.addEventListener('contextmenu', (event) => {
        //     event.preventDefault();
        // });

        // document.addEventListener('selectionchange', () => {
        //     const selection = window.getSelection();
        //     if (selection) {
        //         const selectedText = selection.toString();

        //         if (selectedText) {
        //             this.textSelected = true;
        //             console.log(`Selected Text: "${selectedText}"`);
        //         } else {
        //             this.textSelected = false;
        //         }
        //     }
        // });

        this.mainArea.addEventListener('mousedown', (event) => {
            this.startX = event.clientX;
            this.startY = event.clientY;
            this.currentX = event.clientX;

            const onMouseMove = (moveEvent: MouseEvent) => {
                event.preventDefault();
                this.currentX = moveEvent.clientX;
                const moveX = this.currentX - this.startX;
                this.bookService.moving(moveX);
            };

            const onMouseUp = () => {
                const moveX = this.currentX - this.startX;
                if (moveX < 80 && moveX > -80) {
                    if (this.bookService.animating) return;
                    if (this.startX < 100 && this.startY < 100) {
                        this.bookService.toggleBookmark();
                    } else if (this.startX < 100) {
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
        this.device.hideStatus();

        const bookmarkEl = this.createElement("div", ['bookmark']);
        this.mainArea.appendChild(bookmarkEl);

        this.bookService.init(book);

        this.updateIcon(this.bookService.theme);
        if (this.bookService.theme === 'auto') {
            this.device.tempTheme = this.device.theme;
            document.body.dataset.schema = this.device.theme;
        } else {
            this.device.tempTheme = this.bookService.theme;
            document.body.dataset.schema = this.bookService.theme;
        }
    }

    update() {}

    private showMenu() {
        this.device.showStatus();
        const parentEl = this.mainArea.parentElement!;
        if (!parentEl) return;
        parentEl.classList.remove('hidden');
        // this.bookmarkEl.classList.toggle('fill-icon', this.bookService.isBookmarked);
        this.toggleBookmark(this.bookService.isBookmarked);
        const bookmarkCount = this.getElement('#bookmarkCount', this.btnStart);
        bookmarkCount.textContent = `${this.bookService.bookmarkCount}`;
        const chaperCount = this.getElement('#chaperCount', this.btnEnd);
        chaperCount.textContent = `${this.bookService.chapterCount}`;
    }

    private hideMenu(toggle: boolean = true) {
        if (toggle) {
            this.device.hideStatus();
        }
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

    updateIcon(theme: DeviceTheme) {
        const icons = {
            auto: 'contrast',
            light: 'light_mode',
            dark: 'dark_mode'
        }
        const icon = this.getElement('span', this.bookThemeEl);
        icon.textContent = icons[theme];
    }

    private toggleBookmark(isBookmarked: boolean) {
        this.bookmarkEl.innerHTML = `<span class="material-symbols-outlined icon">${isBookmarked ? 'bookmark_remove' : 'bookmark_add'}</span>`
    }
}