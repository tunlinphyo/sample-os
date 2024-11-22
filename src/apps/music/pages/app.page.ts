import { App } from "../../../components/app";
import { ScrollBar } from "../../../components/scroll-bar";
import { MusicController } from "../../../controllers/music.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Song } from "../../../stores/songs.store";

export class MusicApp extends App {
    private scrollBar: ScrollBar;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private music: MusicController,
    ) {
        super(history, { btnStart: 'artist', btnCenter: 'genres', btnEnd: 'album' });
        this.component.classList.add('historiesPage');
        this.init();
        this.render(music.latest);

        this.scrollBar = new ScrollBar(this.component);
    }

    private init() {
        this.addEventListener('click', () => {
            this.history.pushState('/player', null);
        }, this.btnCenter, false);

        // this.addEventListener('click', () => {
        //     this.history.pushState('/contacts', null);
        // }, this.btnEnd, false);

        // this.addEventListener('click', () => {
        //     this.history.pushState('/dialpad', null);
        // }, this.btnStart, false);

        const musicListener = (status: string, data: any) => {
            if (status === "LATEST_CHANGE") {
                this.update('update', data);
            }
        };

        this.music.addChangeListener(musicListener);

        this.device.addEventListener('closeApp', () => {
            this.music.removeChangeListener(musicListener);
        });
    }

    render(songs: Song[]) {
        const scrollArea = this.createScrollArea();

        const noteList = this.createElement('ul', ['titleList', 'songList']);

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
            noteList.appendChild(noteTitle);
        }

        scrollArea.appendChild(noteList);
        this.mainArea.appendChild(scrollArea);
        this.scrollBar?.reCalculate();
    }

    update(_: string, data: Song[]) {
        this.mainArea.innerHTML = '';
        this.removeAllEventListeners();
        this.render(data);
    }
}