import { SelectItem } from "../../../components/select";
import { Book, Chapter } from "../../../stores/books.store";
import { OSArray } from "../../../utils/arrays";

export class BookService {
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
    }

    get chapters(): number[] {
        if (!this.book) return [];
        return this.book.chapters.map(item => item.pageNumber);
    }
    set chapter(page: number) {
        this.renderChapter(page);
        this._page = page;
    }

    get prevPage() {
        if (!this.page) return 0;
        return this.page - 1;
    }
    get nextPage() {
        if (!this.page) return 2;
        if (this.book?.totalPages === this.page) return 0;
        return this.page + 1;
    }

    init(book: Book) {
        this.book = book;
        this.page = book.currantPage;
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
            this.currPageEl.style.translate = `${num > 0 ? num * 0.5 : num}px 0`;
        }
        if (this.nextPageEl) {
            this.nextPageEl.style.transition = "none";
            this.nextPageEl.style.translate = `calc(50% + ${num > 0 ? 0 : num * 0.5}px) 0`;
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
            this.page = this.page - 1;
            move = true;
        } else if (num < -80) {
            this.page = this.page + 1;
            move = true;
        }
        if (this.currPageEl) {
            this.currPageEl.style.transition = "translate .7s ease";
            if (!move) this.currPageEl.style.translate = `0 0`;
        }
        if (this.nextPageEl) {
            this.nextPageEl.style.transition = "translate .7s ease";
            if (!move) this.nextPageEl.style.translate = `50% 0`;
        }
        if (this.prevPageEl) {
            this.prevPageEl.style.transition = "translate .7s ease";
            if (!move) this.prevPageEl.style.translate = `-101% 0`;
        }
    }

    private renderPrev(page: number) {
        if (!(this.prevPageEl && this.currPageEl)) return;
        this.animating = true;

        this.prevPageEl.style.translate = "0 0";
        this.currPageEl.style.translate = "50% 0";

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
        pageEl.appendChild(topEl);

        const textEl = document.createElement("div");
        textEl.classList.add("page-content");

        if (pageNumber === 1) {
            textEl.innerHTML = this.getCoverPage();
        } else if (this.chapters.includes(pageNumber)) {
            const chapter = this.getChapter(pageNumber);
            if (chapter) textEl.innerHTML = this.getChapterPage(chapter);
        } else if (this.chapters.includes(pageNumber + 1)) {
            textEl.innerHTML = this.getPreChapter();
        } else {
            textEl.innerHTML = this.getBodyPage();
        }

        const footerEl = document.createElement("div");
        footerEl.classList.add("page-footer");
        if (pageNumber > 1) {
            footerEl.innerHTML = `
                <div class="pageNumber">${pageNumber}</div>
            `;
        }

        pageEl.appendChild(topEl);
        pageEl.appendChild(textEl);
        pageEl.appendChild(footerEl);

        switch (status) {
            case "prev":
                pageEl.style.translate = "-102% 0";
                pageEl.style.zIndex = "6";
                break;
            case "next":
                pageEl.style.translate = "50% 0";
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

    private getCoverPage() {
        return `
            <div class="cover">
                <h1>${this.book?.title}</h1>
                <p>${this.book?.author}</p>
            </div>
        `;
    }

    private getChapterPage(chapter: Chapter) {
        return `
            <div class="chapter">
                <h2>Chapter ${chapter.index}</h2>
                <h3>${chapter.title}</h3>
                <p>
                    Aliquam nulla facilisi cras odio eu feugiat pretium nibh. Blandit cursus risus at ultrices. Et netus et malesuada fames ac
                    turpis egestas sed tempus. Suspendisse in est ante in nibh. Felis eget nunc lobortis mattis aliquam faucibu. Sapien nec sagittis
                    aliquam males uada biben dum arcu vitae aute irure sint
                </p>
            </div>
        `;
    }

    private getPreChapter() {
        return `
            <p>
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
                dolor in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non.
            </p>
        `;
    }

    private getBodyPage() {
        const pages: string[] = [
            `
                <p>
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
                    dolor in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non.
                </p>
                <p>
                    Sapien nec sagittis aliquam malesuada bibendum arcu vitae elementum curabitur. Nunc eget lorem dolor sed viverra ipsum nunc.
                </p>
                <p>
                    Aliquam nulla facilisi cras odio eu feugiat pretium nibh. Blandit cursus risus at ultrices. Et netus et malesuada fames ac
                    turpis egestas sed tempus. Suspendisse in est ante in nibh. Felis eget nunc lobortis mattis aliquam faucibu. aliquip cras
                </p>
            `,
            `
                <p>
                    Pellentesque id nibh tortor id. Morbi blandit cursus risus at ultrices mi tempus. Turpis egestas maecenas pharetra convallis
                    posuere morbi leo. Sed augue lacus viverra vitae congue eu.
                </p>
                <p>
                    Ac orci phasellus egestas tellus rutrum. Rhoncus urna neque viverra justo nec ultrices dui. Viverra vitae congue eu consequat ac felis donec.
                </p>
                <p>
                    Risus in hendrerit gravida rutrum quisque non tellus orci. Et malesuada fames ac turpis egestas sed tempus. Sed odio morbi quis
                    commodo odio aenean sed. Eget aliquet nibh praesent tristique magna.
                </p>
            `,
            `
                <p>
                    Sit amet porttitor eget dolor morbi non arcu risus quis. Leo vel orci porta non pulvinar. Pharetra convallis posuere morbi leo
                    urna molestie at elementum eu. Pellentesque adipiscing commodo elit at imperdiet.
                </p>
                <p>
                    Est placerat in egestas erat imperdiet sed euismod nisi. Risus ultricies tristique nulla aliquet enim. Faucibus nisl tincidunt
                    eget nullam non nisi est sit. Sed adipiscing diam donec adipiscing tristique risus nec feugiat in. Tincidunt augue interdum velit
                    euismod in. Bibendum enim facilisis gravida neque convallis a cras. Aenean et tortor at risus viverra adipiscing. Magnis dis
                    part
                </p>
            `,
            `
                <p>
                    Convallis tellus id interdum velit laoreet id. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus. Odio
                    tempor orci dapibus ultrices. Auctor elit sed vulputate mi sit amet mauris. Nunc scelerisque viverra mauris in aliquam sem
                    fringilla. Tristique risus nec feugiat in fermentum posuere urna nec tincidunt.
                </p>
                <p>
                    Sapien nec sagittis aliquam malesuada bibendum arcu vitae elementum curabitur. Aliquam nulla facilisi cras odio eu feugiat
                    pretium nibh. Blandit cursus risus at ultrices. Et netus et malesuada fames ac
                    turpis egestas sed tempus. Suspendisse in est ante in nibh. Felis eget nunc lobortis mattis aliquam
                </p>
            `,
            `
                <p>
                    Lectus quam id leo in. Enim sed faucibus turpis in eu mi bibendum. Pharetra pharetra massa massa ultricies mi quis. Sed risus
                    pretium quam vulputate. Commodo elit at imperdiet dui accumsan sit.
                </p>
                <p>
                    Odio aenean sed adipiscing diam donec adipiscing tristique. Semper quis lectus nulla at volutpat diam. Condimentum id venenatis
                    a condimentum vitae sapien pellentesque habitant morbi.
                </p>
                <p>
                    Aliquam purus sit amet luctus venenatis lectus magna fringilla urna. Posuere lorem ipsum dolor sit amet consectetur.
                    Sapien nec sagittis aliquam malesuada bibendum arcu vitae amet mauris.
                </p>
            `,
            `
                <p>
                    Sed faucibus turpis in eu. Phasellus egestas tellus rutrum tellus pellentesque eu tincidunt tortor aliquam. Volutpat maecenas
                    volutpat blandit aliquam etiam erat. Nunc aliquet bibendum enim facilisis gravida neque convallis a cras. Aliquam purus sit amet
                    luctus venenatis lectus magna fringilla. Cursus risus at ultrices mi tempus imperdiet nulla. Scelerisque in dictum non consectetur
                    a erat nam. Et ultrices neque ornare aenean euismod elementum.
                    Sapien nec sagittis aliquam malesuada bibendum arcu vitae elementum curabitur. Nunc eget lorem dolor sed viverra ipsum nunc.
                    Aliquam nulla facilisi cras odio eu feugiat pretium
                </p>
            `,
        ]
        return OSArray.getRandomElement(pages);
    }

    private isPrev(page: number) {
        return page > 1;
    }

    private isNext(page: number) {
        return page < this.book!.totalPages;
    }

    private getChapter(page: number) {
        return this.book!.chapters.find(item => item.pageNumber === page);
    }
}