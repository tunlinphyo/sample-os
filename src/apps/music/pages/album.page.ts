import { Page } from "../../../components/page";
import { ScrollBar } from "../../../components/scroll-bar";
import { MusicController } from "../../../controllers/music.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Album } from "../../../stores/album.store";
import { Song } from "../../../stores/songs.store";

export class AlbumPage extends Page {
    private scrollBar?: ScrollBar;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private music: MusicController,
    ) {
        super(history, { btnEnd: 'more_horiz' });
        this.component.classList.add('albumsPage');
        this.init();

        this.scrollBar = new ScrollBar(this.component);
    }

    private init() {
        this.addEventListener('click', () => {
            this.history.pushState('/contacts/new', null);
        }, this.btnEnd, false);

        const musicListener = (status: string) => {
            console.log(status);
        };

        this.music.addChangeListener(musicListener);

        this.device.addEventListener('closeApp', () => {
            this.music.removeChangeListener(musicListener);
        });
    }

    render(album: Album) {
        console.log(album);
        const scrollArea = this.createScrollArea();

        const albumBanner = this.createElement('div', ['albumBanner']);
        const artists = album.artists?.map(artist => artist.name) || [];
        albumBanner.innerHTML = `
            <h3 class="albumName">${album.name}</h3>
            <div class="artists">${artists.join(', ')}</div>
        `;

        scrollArea.appendChild(albumBanner);

        if (album.songs && album.songs.length) {
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
                this.music.playAll(null, album.songs as Song[]);
                this.history.pushState('/player', null);
            }, playAll);

            this.addEventListener('click', () => {
                this.music.playAll(null, album.songs as Song[], true);
                this.history.pushState('/player', null);
            }, shuffleAll);

            playActions.appendChild(playAll);
            playActions.appendChild(shuffleAll);

            scrollArea.appendChild(playActions);
        }

        const songList = this.createElement('ul', ['titleList', 'songList']);
        if (album.songs) {
            for (const song of album.songs) {
                const noteTitle = this.createElement('li', ['titleItem']);
                noteTitle.innerHTML = `
                    <span class="albumCover">
                        <span class="material-symbols-outlined">music_note</span>
                    </span>
                    <span class="contactName">${song.title}</span>
                `;
                this.addEventListener('click', () => {
                    this.music.playMusic(song, album.songs);
                    this.history.pushState('/player', null);
                }, noteTitle);
                songList.appendChild(noteTitle);
            }
        }

        scrollArea.appendChild(songList);
        this.mainArea.appendChild(scrollArea);
        // if (!this.scrollBar) {
        //     this.scrollBar = new ScrollBar(this.component);
        // } else {
        // }
        this.scrollBar?.reCalculate();
    }

    update(_: string, data: Album) {
        this.mainArea.innerHTML = '';
        this.removeAllEventListeners();
        this.render(data);
    }
}