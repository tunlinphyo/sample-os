import { App } from "../../../components/app";
import { ScrollBar } from "../../../components/scroll-bar";
import { MusicController } from "../../../controllers/music.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Song } from "../../../stores/songs.store";

export class MusicApp extends App {
    private scrollBar: ScrollBar;
    private playerBtn: HTMLButtonElement;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private music: MusicController,
    ) {
        super(history, { btnStart: 'artist', btnEnd: 'library_music' });
        this.component.classList.add('latestPage');
        this.playerBtn = this.createPlayer();
        this.component.appendChild(this.playerBtn);
        this.init();
        this.render(music.latest);

        this.scrollBar = new ScrollBar(this.component);
    }

    private init() {
        this.addEventListener('click', () => {
            this.history.pushState('/player', null);
        }, this.playerBtn, false);

        this.addEventListener('click', () => {
            this.history.pushState('/albums', null);
        }, this.btnEnd, false);

        // this.addEventListener('click', () => {
        //     this.history.pushState('/dialpad', null);
        // }, this.btnStart, false);

        const musicListener = (status: string, data: any) => {
            if (status === "LATEST_CHANGE") {
                this.update('update', data);
            }
            if (status === 'SONG_PLAY_STATUS') {
                if (data === 'playing') {
                    this.component.classList.add('playing');
                } else {
                    this.component.classList.remove('playing');
                }
            }
        };

        if (this.music.status == 'playing') {
            this.component.classList.add('playing');
        }

        this.music.addChangeListener(musicListener);

        this.device.addEventListener('closeApp', () => {
            this.music.removeChangeListener(musicListener);
        });
    }

    render(songs: Song[]) {
        const scrollArea = this.createScrollArea();

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
        this.mainArea.appendChild(scrollArea);
        this.scrollBar?.reCalculate();
    }

    update(_: string, data: Song[]) {
        this.mainArea.innerHTML = '';
        this.removeAllEventListeners();
        this.render(data);
    }

    private createPlayer() {
        const playerBtn = this.createElement<HTMLButtonElement>('button', ['playerButton']);
        playerBtn.innerHTML = `<span class="material-symbols-outlined icon">genres</span>`;

        return playerBtn;
    }
}