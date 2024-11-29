import { SelectItem } from "../../../components/select";
import { DeviceTheme } from "../../../device/device";
import { Book } from "../../../stores/books.store";

export class EBookService {
    private book: Book | undefined;
    private _page: number = 1;

    private prevPageEl: HTMLElement | undefined;
    private currPageEl: HTMLElement | undefined;
    private nextPageEl: HTMLElement | undefined;

    public animating: boolean = false;

    constructor(private component: HTMLElement) {}

    get page() {
        return this._page;
    }
    set page(page: number) {
        if (page < this._page) {
            console.log("RENDER PREV", page);
            this.renderPrev(page);
        }
        if (page > this._page) {
            console.log("RENDER NEXT", page);
            this.renderNext(page);
        }
        this._page = page;
        this.toggleCurrPageBookmark();
        // this.eventListeners();
    }

    get chapters(): number[] {
        if (!this.book) return [];
        return this.book.chapters.map(item => item.pageNumber);
    }
    set chapter(page: number) {
        this.renderChapter(page);
        this._page = page;
        this.toggleCurrPageBookmark();
    }

    get prevPage() {
        if (!this.page) return 0;
        return Math.max(this.page - 1, 0);
    }
    get nextPage() {
        if (!this.page) return 0;
        if (this.book!.totalPages <= this.page) return 0;
        return Math.min(this.page + 1, this.book?.totalPages || 0);
    }

    get percentage() {
        if (!this.book) return 0;
        return Math.round(this.book.currantPage / this.book.totalPages * 100);
    }

    get bookmarkCount() {
        if (!this.book) return 0;
        return this.book.bookmarks.length;
    }

    get chapterCount() {
        if (!this.book) return 0;
        return this.book.chapters.length;
    }

    get isBookmarked() {
        if (!this.book) return false;
        return this.book.bookmarks.includes(this._page);
    }

    get theme(): DeviceTheme {
        return this.book?.theme || 'auto';
    }
    set theme(theme: DeviceTheme) {
        if (this.book) {
            this.book.theme = theme;
        }
    }

    private getPercentage(page: number) {
        if (!this.book) return 0;
        console.log('getPercentage', page, this.book.totalPages)
        return Math.floor(page / this.book.totalPages * 100);
    }

    init(book: Book) {
        this.book = book;
        this.page = book.currantPage;
        this.animating = false;
        this.renderPage();
    }

    prev() {
        setTimeout(() => {
            if (this.animating) return;
            if (!this.prevPage) return;
            this.page = this.page - 1;
        }, 0);
    }

    next() {
        setTimeout(() => {
            if (this.animating) return;
            if (!this.nextPage) return;
            this.page = this.page + 1;
        }, 0);
    }

    getData() {
        if (!this.book) return;
        this.book.lastReadDate = new Date();
        this.book.currantPage = this.page;
        return this.book;
    }

    getBookmarks() {
        const list: SelectItem[] = [];
        const bookmarks = this.book!.bookmarks.sort((a, b) => a - b);

        for(const item of bookmarks) {
            list.push({
                title: `Page: ${item - 1}`,
                value: item.toString(),
                icon: 'bookmark'
            });
        }

        return list;
    }

    getChapters() {
        const list: SelectItem[] = [];

        for(const item of this.book!.chapters) {
            list.push({
                title: item.title,
                value: item.pageNumber.toString(),
            });
        }

        return list;
    }

    moving(num: number) {
        if (this.animating) return;
        if (this.currPageEl) {
            this.currPageEl.style.transition = "none";
            this.currPageEl.style.translate = `${num > 0 ? num * 0.35 : num}px 0`;
        }
        if (this.nextPageEl) {
            this.nextPageEl.style.transition = "none";
            this.nextPageEl.style.translate = `calc(35% + ${num > 0 ? 0 : num * 0.35}px) 0`;
        }
        if (this.prevPageEl) {
            this.prevPageEl.style.transition = "none";
            this.prevPageEl.style.translate = `calc(-101% + ${num > 0 ? num : 0}px) 0`;
        }
    }

    moveEnd(num: number) {
        if (this.animating) return;
        let move: boolean = false;
        if (num > 80) {
            move = this.page != 1;
            this.page = Math.max(this.page - 1, 1);
        } else if (num < -80) {
            move = this.page != this.book!.totalPages;
            this.page = Math.min(this.page + 1, this.book!.totalPages);
        }
        if (this.currPageEl) {
            this.currPageEl.style.transition = "translate .7s ease";
            if (!move) this.currPageEl.style.translate = `0 0`;
        }
        if (this.nextPageEl) {
            this.nextPageEl.style.transition = "translate .7s ease";
            if (!move) this.nextPageEl.style.translate = `35% 0`;
        }
        if (this.prevPageEl) {
            this.prevPageEl.style.transition = "translate .7s ease";
            if (!move) this.prevPageEl.style.translate = `-101% 0`;
        }
    }

    toggleBookmark() {
        if (!this.book) return;
        if (this.isBookmarked) {
            this.book.bookmarks = this.book.bookmarks.filter(item => item != this._page);
            this.toggleCurrPageBookmark();
        } else {
            this.book.bookmarks.push(this._page);
            this.toggleCurrPageBookmark();
        }
    }

    protected eventListeners() {
        document.addEventListener('selectionchange', (event) => {
            event.preventDefault();
            const selection = window.getSelection();
            if (selection) {
                const selectedText = selection.toString();

                if (selectedText) {
                    console.log(`Selected Text: "${selectedText}"`);
                }
            }
        });
    }

    private renderPrev(page: number) {
        if (!(this.prevPageEl && this.currPageEl)) return;
        this.animating = true;

        this.prevPageEl.style.translate = "0 0";
        this.currPageEl.style.translate = "35% 0";

        const transitionEndHandler = () => {
            this.currPageEl!.removeEventListener('transitionend', transitionEndHandler);
            console.log("TRANSITION_END");
            if (this.nextPageEl) this.nextPageEl.remove();
            this.nextPageEl = this.currPageEl;
            this.nextPageEl!.style.zIndex = "4";
            this.currPageEl = this.prevPageEl;
            this.currPageEl!.style.zIndex = "5";
            console.log("IS_PREV", this.isPrev(page));
            if (this.isPrev(page)) {
                const prevPage = page - 1;
                this.prevPageEl = this.createPage(prevPage, "prev");
            } else {
                this.prevPageEl = undefined;
            }
            this.animating = false;
            console.log(this.prevPageEl?.id, this.currPageEl?.id, this.nextPageEl?.id);
        };
        this.currPageEl.addEventListener('transitionend', transitionEndHandler);
    }

    private renderNext(page: number) {
        if (!(this.currPageEl && this.nextPageEl)) return;
        this.animating = true;

        this.currPageEl.style.translate = "-102% 0";
        this.nextPageEl.style.translate = "0 0";

        const transitionEndHandler = () => {
            this.currPageEl!.removeEventListener('transitionend', transitionEndHandler);
            console.log("TRANSITION_END");
            if (this.prevPageEl) this.prevPageEl.remove();
            this.prevPageEl = this.currPageEl;
            this.prevPageEl!.style.zIndex = "6";
            this.currPageEl = this.nextPageEl;
            this.currPageEl!.style.zIndex = "5";
            console.log("IS_NEXT", this.isNext(page));
            if (this.isNext(page)) {
                const nextPage = page + 1;
                this.nextPageEl = this.createPage(nextPage, "next");
            } else {
                this.nextPageEl = undefined;
            }
            this.animating = false;
            console.log(this.prevPageEl?.id, this.currPageEl?.id, this.nextPageEl?.id);
        };
        this.currPageEl.addEventListener('transitionend', transitionEndHandler);
    }

    private renderPage() {
        if (this.prevPageEl) this.prevPageEl.remove();
        if (this.currPageEl) this.currPageEl.remove();
        if (this.nextPageEl) this.nextPageEl.remove();

        console.log("RENDER", this.nextPage);

        this.currPageEl = this.createPage(this.page, "curr");
        if (this.prevPage) this.prevPageEl = this.createPage(this.prevPage, "prev");
        if (this.nextPage) this.nextPageEl = this.createPage(this.nextPage, "next");
    }

    private renderChapter(page: number) {
        if (this.prevPageEl) this.prevPageEl.remove();
        if (this.currPageEl) this.currPageEl.remove();
        if (this.nextPageEl) this.nextPageEl.remove();

        this.prevPageEl = this.createPage(page - 1, "prev");
        this.currPageEl = this.createPage(page, "curr");
        this.nextPageEl = this.createPage(page + 1, "next");
    }

    private createPage(pageNumber: number, status: "prev" | "curr" | "next") {
        const pageEl = document.createElement("div");
        pageEl.classList.add("page");
        pageEl.id = `page-${pageNumber}`;

        const topEl = document.createElement("div");
        topEl.classList.add("page-header");
        if (pageNumber == 1) {
            topEl.innerHTML = '';
        } else {
            topEl.innerHTML = `
                <div class="pageInfo">
                    <div class="percentage">${this.getPercentage(pageNumber)}%</div>
                    <div class="island"></div>
                    <div class="pageno">No.${pageNumber - 1}</div>
                </div>
            `;
        }
        pageEl.appendChild(topEl);

        const textEl = document.createElement("div");
        textEl.classList.add("page-content");

        textEl.innerHTML = this.getContentBypageNumber(pageNumber);

        const footerEl = document.createElement("div");
        footerEl.classList.add("page-footer");
        // if (pageNumber > 1) {
        //     footerEl.innerHTML = `
        //         <div class="pageNumber">${pageNumber - 1}</div>
        //     `;
        // }

        pageEl.appendChild(topEl);
        pageEl.appendChild(textEl);
        pageEl.appendChild(footerEl);

        switch (status) {
            case "prev":
                pageEl.style.translate = "-102% 0";
                pageEl.style.zIndex = "6";
                break;
            case "next":
                pageEl.style.translate = "35% 0";
                pageEl.style.zIndex = "4";
                break;
            default:
                pageEl.style.translate = "0 0";
                pageEl.style.zIndex = "5";
                break;
        }

        this.component.appendChild(pageEl);
        return pageEl;
    }

    private isPrev(page: number) {
        return page > 1;
    }

    private isNext(page: number) {
        return page < this.book!.totalPages;
    }

    private getCoverPage() {
        return `
            <div class="cover">
                <h1>${this.book?.title}</h1>
                <p>${this.book?.author}</p>
            </div>
        `;
    }

    private getContentBypageNumber(page: number) {
        if (page == 1) return this.getCoverPage();
        if (!this.book) return 'No Book.';
        const content = this.book.contents.find(item => item.startPage <= page && item.endPage >= page);
        if (!content) return 'No Content.';
        const index = page - content.startPage;
        const data = content.pages[index];
        if (!data) return '';
        return data;
    }

    private toggleCurrPageBookmark() {
        const bookamrkEl = this.component.querySelector(".bookmark");
        if (!bookamrkEl) return;
        if (this.isBookmarked) {
            bookamrkEl.classList.add("show");
        } else {
            bookamrkEl.classList.remove("show");
        }
    }
}