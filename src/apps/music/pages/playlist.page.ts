import { Page } from "../../../components/page";
import { ScrollBar } from "../../../components/scroll-bar";
import { MusicController } from "../../../controllers/music.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Music } from "../../../stores/music.store";

export class PlaylistPage extends Page {
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
            // console.log(status);
        };

        this.music.addChangeListener(musicListener);

        this.device.addEventListener('closeApp', () => {
            this.music.removeChangeListener(musicListener);
        });
    }

    render(music: Music) {
        const scrollArea = this.createScrollArea();

        const albumBanner = this.createElement('div', ['albumBanner']);
        albumBanner.innerHTML = `
            <h3 class="albumName">${music.name}</h3>
        `;

        scrollArea.appendChild(albumBanner);
        const songs = this.music.getSongs(music.songIds);

        if (music.songIds.length) {
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
                this.music.playAll(music.id, songs);
                this.history.pushState('/player', null);
            }, playAll);

            this.addEventListener('click', () => {
                this.music.playAll(music.id, songs, true);
                this.history.pushState('/player', null);
            }, shuffleAll);

            playActions.appendChild(playAll);
            playActions.appendChild(shuffleAll);

            scrollArea.appendChild(playActions);
        }

        if (music.songIds.length) {
            const songList = this.createElement('ul', ['titleList', 'songList']);
            for (const song of songs) {
                const noteTitle = this.createElement('li', ['titleItem']);
                noteTitle.innerHTML = `
                    <span class="albumCover">
                        <span class="material-symbols-outlined">music_note</span>
                    </span>
                    <span class="contactName">${song.title}</span>
                `;
                this.addEventListener('click', () => {
                    this.music.playMusic(song, songs);
                    this.history.pushState('/player', null);
                }, noteTitle);
                songList.appendChild(noteTitle);
            }
            scrollArea.appendChild(songList);
        } else {
            this.renderNoData('Add songs', scrollArea);
        }
        this.mainArea.appendChild(scrollArea);
        // if (!this.scrollBar) {
        //     this.scrollBar = new ScrollBar(this.component);
        // } else {
        //     this.scrollBar?.reCalculate();
        // }
        this.scrollBar?.reCalculate();
    }

    update(_: string, data: Music) {
        this.mainArea.innerHTML = '';
        this.removeAllEventListeners();
        this.render(data);
    }
}