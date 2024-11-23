import { Page } from "../../../components/page";
import { ScrollBar } from "../../../components/scroll-bar";
import { MusicController } from "../../../controllers/music.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Album } from "../../../stores/album.store";

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
    }

    private init() {
        this.addEventListener('click', () => {
            this.history.pushState('/contacts/new', null);
        }, this.btnEnd, false);

        const musicListener = (status: string) => {
            // console.log(status);
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

        scrollArea.appendChild(albumBanner);
        scrollArea.appendChild(songList);
        this.mainArea.appendChild(scrollArea);
        if (!this.scrollBar) {
            this.scrollBar = new ScrollBar(this.component);
        } else {
            this.scrollBar?.reCalculate();
        }
    }

    update(_: string, data: Album) {
        this.mainArea.innerHTML = '';
        this.removeAllEventListeners();
        this.render(data);
    }
}