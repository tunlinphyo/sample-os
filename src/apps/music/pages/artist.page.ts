import { Page } from "../../../components/page";
import { ScrollBar } from "../../../components/scroll-bar";
import { MusicController } from "../../../controllers/music.controller";
import { HistoryStateManager } from "../../../device/history.manager";
import { Artist } from "../../../stores/artist.store";

export class ArtistPage extends Page {
    private scrollBar?: ScrollBar;

    constructor(
        history: HistoryStateManager,
        private music: MusicController,
    ) {
        super(history, { btnEnd: 'queue_music' });
        this.component.classList.add('albumsPage');
        this.init();

        this.scrollBar = new ScrollBar(this.component);
    }

    private init() {
        this.addEventListener('click', () => {
            this.history.pushState('/queue', null);
        }, this.btnEnd, false);
    }

    render(artist: Artist) {
        const scrollArea = this.createScrollArea();

        const albumBanner = this.createElement('div', ['albumBanner']);
        albumBanner.innerHTML = `
            <h3 class="albumName">${artist.name}</h3>
        `;

        scrollArea.appendChild(albumBanner);

        const songs = this.music.getSongsByArtist(artist.id);

        if (songs) {
            const playActions = this.createElement('div', ['playActions']);

            const playAll = this.createElement('button', ['playAll']);
            playAll.innerHTML = `
                <span class="material-symbols-outlined icon">play_arrow</span>
                <span>Play</span>
            `;
            const shuffleAll = this.createElement('button', ['shuffleAll']);
            shuffleAll.innerHTML = `
                <span class="material-symbols-rounded">shuffle</span>
                <span>Shuffle</span>
            `;

            this.addEventListener('click', () => {
                this.music.playAll(null, songs);
                this.history.pushState('/player', null);
            }, playAll);

            this.addEventListener('click', () => {
                this.music.playAll(null, songs, true);
                this.history.pushState('/player', null);
            }, shuffleAll);

            playActions.appendChild(playAll);
            playActions.appendChild(shuffleAll);

            scrollArea.appendChild(playActions);
        }

        const albums = this.music.getAlbumsByArtist(artist.id);

        if (albums.length) {
            const albumList = this.createElement('ul', ['titleList', 'albumList']);
            for (const album of albums) {
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
        } else {
            this.renderNoData('No Songs', scrollArea);
        }
        this.mainArea.appendChild(scrollArea);
        this.scrollBar?.reCalculate();
    }

    update(_: string, data: Artist) {
        this.mainArea.innerHTML = '';
        this.removeAllEventListeners();
        this.render(data);
    }
}