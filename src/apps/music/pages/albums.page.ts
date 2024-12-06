import { Page } from "../../../components/page";
import { ScrollBar } from "../../../components/scroll-bar";
import { HistoryStateManager } from "../../../device/history.manager";
import { Album } from "../../../stores/album.store";

export class AlbumsPage extends Page {
    private scrollBar?: ScrollBar;

    constructor(
        history: HistoryStateManager
    ) {
        super(history, { });
        this.component.classList.add('albumsPage');

        this.scrollBar = new ScrollBar(this.component);
    }

    // private init() {
    //     this.addEventListener('click', () => {
    //         this.history.pushState('/queue', null);
    //     }, this.btnEnd, false);
    // }


    render(data: Album[]) {
        const scrollArea = this.createScrollArea();
        const albumList = this.createElement<HTMLUListElement>('ul', ['albumList']);

        for (const album of data) {
            const albumEl = this.createElement<HTMLLIElement>('li', ['albumCard']);

            const albumRecord = this.createElement('div', ['albumRecord']);
            albumRecord.innerHTML = `
                <span class="record">
                    <span class="material-symbols-outlined">music_note</span>
                </span>
            `;

            const albumBtn = this.createElement('button', ['albumButton']);
            const artists = album.artists?.map(artist => artist.name) || [];
            albumBtn.innerHTML = `
                <div class="albumName">${album.name}</div>
                <div class="artists">${artists.join(', ')}</div>
            `;

            this.addEventListener('click', () => {
                this.history.pushState('/albums/detail', album.id);
            }, albumBtn);

            albumEl.appendChild(albumRecord);
            albumEl.appendChild(albumBtn);
            albumList.appendChild(albumEl);

        }

        scrollArea.appendChild(albumList);
        this.mainArea.appendChild(scrollArea);
        this.scrollBar?.reCalculate();
        this.observe(albumList);
    }

    update(_: string, data: Album[]) {
        this.mainArea.innerHTML = '';
        this.removeAllEventListeners();
        this.render(data);
    }

    observe(albumList: HTMLUListElement) {
        const observer = new IntersectionObserver(entires => {
            for (const entry of entires) {
                const elem = entry.target as HTMLElement;
                elem.style.scale = `${entry.isIntersecting ? 1 : 0.9}`;
                elem.style.zIndex = `${entry.isIntersecting ? 1 : 0}`;
            }
        }, {
            threshold: 0.6
        });

        Array.from(albumList.children).forEach(child => {
            observer.observe(child)
        })
    }
}
