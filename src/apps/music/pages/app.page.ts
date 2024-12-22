import { App } from "../../../components/app";
// import { ScrollBar } from "../../../components/scroll-bar";
import { MusicController } from "../../../controllers/music.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Music } from "../../../stores/music.store";

export class MusicApp extends App {
    private btnPrev: HTMLButtonElement;
    private btnPlay: HTMLButtonElement;
    private btnNext: HTMLButtonElement;
    private queueButton: HTMLButtonElement;

    private record: HTMLElement;
    private playHand: HTMLElement;
    private timeCurrent: HTMLElement;
    private timeDuration: HTMLElement;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private music: MusicController,
    ) {
        super(history, { btnEnd: 'art_track' });
        this.component.classList.add('musicRecoderPage');

        this.btnPrev = this.createElement<HTMLButtonElement>('button', ['btnPrev']);
        this.btnPlay = this.createElement<HTMLButtonElement>('button', ['btnPlay']);
        this.btnNext = this.createElement<HTMLButtonElement>('button', ['btnNext']);
        this.queueButton = this.createElement<HTMLButtonElement>('button', ['queueButton']);

        this.record = this.createElement('div', ['record']);
        this.playHand = this.createElement('div', ['playHand']);

        this.timeCurrent = this.createElement('div', ['time', 'timeCurrent']);
        this.timeDuration = this.createElement('div', ['time', 'timeDuration']);


        this.init();
        this.render(music.list);
    }

    private init() {
        this.addEventListener('click', () => {
            this.history.pushState('/albums', null);
        }, this.btnEnd, false);

        this.addEventListener('click', () => {
            this.history.pushState('/player', null);
        }, this.record, false);

        this.addEventListener('click', () => {
            this.history.pushState('/queue', null);
        }, this.queueButton, false);

        this.addEventListener('click', () => {
            if (this.music.status == 'playing') {
                this.music.pause();
            } else {
                this.music.recordPlay();
            }
        }, this.btnPlay, false);

        this.addEventListener('click', () => {
            this.music.playPrevSong();
        }, this.btnPrev, false);

        this.addEventListener('click', () => {
            this.music.playNextSong();
        }, this.btnNext, false);

        const musicListener = (status: string, data: any) => {
            if (status === "LATEST_CHANGE") {
                this.update('update', data);
            }
            if (status === 'SONG_PLAY_STATUS') {
                this.renderPlayButton(this.music.status);
            }
            if (status === 'SONG_TIMELINE_STATUS') {
                this.renderDuration();
            }
            if (status === 'UPDATE_ALBUM_FAVORITE') {
                this.update('update', this.music.list);
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

    render(list: Music[]) {
        console.log(list);

        const recoder = this.createElement('div', ['musicRecoder']);

        const recordContainer = this.createRecord();
        const recordActions = this.createActions();

        recoder.appendChild(recordContainer);
        recoder.appendChild(recordActions);

        this.renderPlayButton(this.music.status);
        this.renderDuration();

        this.mainArea.appendChild(recoder);
    }

    update(_: string, data: Music[]) {
        this.mainArea.innerHTML = '';
        this.removeAllEventListeners();
        this.render(data);
    }

    private renderDuration() {
        this.timeCurrent.textContent = `${this.getTimeString(this.music.time)}`;
        this.timeDuration.textContent = `${this.getTimeString(this.music.duration)}`;
    }

    private renderPlayButton(status: string) {
        this.record.classList.toggle('active', status == 'playing');
        this.playHand.classList.toggle('active', status == 'playing');
        this.btnPlay.innerHTML = `<span class="material-symbols-outlined icon fill-icon">${status == 'playing' ? 'stop' : 'play_arrow'}</span>`;

        const marquee = this.getElement('p', this.playHand)
        const song = this.music.getSong(this.music.currentSong?.id || '')
        if (marquee) {
            if (!song) {
                marquee.textContent = '';
            } else {
                const artist = song.artists ? song.artists[0].name : '';
                marquee.textContent = `${song.title} - ${artist} - ${song.album?.name}`;
            }
        }
    }
    private createRecord() {
        const recordContainer = this.createElement('div', ['recordContainer']);
        
        this.record.innerHTML = `<div class="recordCenter"></div>`;

        this.record.appendChild(this.timeCurrent);
        this.record.appendChild(this.timeDuration);
        recordContainer.appendChild(this.record);

        return recordContainer;
    }

    private createActions() {
        const recordActions = this.createElement('div', ['recordActions']);
        const musicControl = this.createElement('div', ['musicControl']);


        this.playHand.innerHTML = `<div class="playHandCircle">
            <div class="playHandStick">
                <div class="marquee">
                    <p>This is a scrolling marquee effect using CSS!</p>
                </div>
            </div>
        </div>`;

        this.btnPrev.innerHTML = `<span class="material-symbols-outlined icon fill-icon">skip_previous</span>`;
        this.btnPlay.innerHTML = `<span class="material-symbols-outlined icon fill-icon">stop</span>`;
        this.btnNext.innerHTML = `<span class="material-symbols-outlined icon fill-icon">skip_next</span>`;
        this.queueButton.innerHTML = `<span class="material-symbols-outlined icon">queue_music</span>`;

        musicControl.appendChild(this.btnPrev);
        musicControl.appendChild(this.btnPlay);
        musicControl.appendChild(this.btnNext);

        this.playHand.appendChild(this.queueButton);

        recordActions.appendChild(musicControl);
        recordActions.appendChild(this.playHand);

        return recordActions;
    }

    private getTimeString(time: number) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(1, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}