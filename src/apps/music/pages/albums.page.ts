import { Page } from "../../../components/page";
import { ScrollBar } from "../../../components/scroll-bar";
import { HistoryStateManager } from "../../../device/history.manager";
import { Album } from "../../../stores/album.store";

export class AlbumsPage extends Page {
    private scrollBar?: ScrollBar;

    constructor(
        history: HistoryStateManager
    ) {
        super(history, { btnEnd: 'queue_music' });
        this.component.classList.add('musicPage');
        this.init();
    }

    private init() {
        this.addEventListener('click', () => {
            this.history.pushState('/queue', null);
        }, this.btnEnd, false);
    }

    render(data: Album[]) {
        console.log(data);
        const scrollArea = this.createScrollArea();

        const albumList = this.createElement('ul', ['titleList', 'albumList']);

        for (const album of data) {
            const albumEl = this.createElement('li', ['albumCard']);

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
        if (!this.scrollBar) {
            this.scrollBar = new ScrollBar(this.component);
        } else {
            this.scrollBar?.reCalculate();
        }
    }

    update(_: string, data: Album[]) {
        this.mainArea.innerHTML = '';
        this.removeAllEventListeners();
        this.render(data);
    }
}