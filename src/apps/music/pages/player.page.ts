import { Modal } from "../../../components/modal";
import { MusicController } from "../../../controllers/music.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { TrackSlider } from "./track.slider";
import { debounce } from "../../../utils/debounce";

export class MusicPlayer extends Modal {
    private playButton: HTMLButtonElement;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private music: MusicController
    ) {
        super(history, { btnStart: 'repeat', btnEnd: 'favorite' });
        this.component.classList.add('musicPlayerPage');

        this.playButton = this.createElement<HTMLButtonElement>('button', ['playButton']);
        this.init();
    }

    init() {
        const musicListener = (status: string, data: any) => {
            if (status === "SONG_CHANGE") {
                this.update('update');
            }
            if (status === 'SONG_PLAY_STATUS') {
                this.renderPlayButton(data);
            }
            if (status === 'SONG_TIMELINE_STATUS') {
                this.dispatchCustomEvent('updateTrack');
            }
        };

        this.music.addChangeListener(musicListener);

        this.device.addEventListener('closeApp', () => {
            this.music.removeChangeListener(musicListener);
        });
    }

    render() {
        const playerEl = this.renderPlayer();
        this.mainArea.appendChild(playerEl);
    }

    update(_: string) {
        if (!this.isActive) return;
        this.removeAllEventListeners();
        this.mainArea.innerHTML = '';
        this.render();
    }

    private renderPlayer() {
        const container = this.createElement('div', ['playerContainer']);
        if (!this.music.currentSong) {
            container.classList.add('disabled')
        }

        const infoContiner = this.renderInfo();
        const controlContiner = this.renderControl();
        const timelineContiner = this.renderTimelineControl();

        container.appendChild(infoContiner);
        container.appendChild(controlContiner);
        container.appendChild(timelineContiner);

        return container;
    }

    private renderInfo() {
        const infoContiner = this.createElement('div', ['infoContainer']);

        const titleEl = this.createElement('h3', ['songTitle']);
        titleEl.textContent = `${this.music.currentSong?.title || "No Song"}`;
        const artistEl = this.createElement('div', ['articeName']);
        const names = this.music.currentSong?.artists?.map(item => item.name) || [];
        artistEl.textContent = `${names?.join(", ")}`;

        infoContiner.appendChild(titleEl);
        infoContiner.appendChild(artistEl);

        return infoContiner;
    }

    private renderControl() {
        const controlContiner = this.createElement('div', ['controlContainer']);

        const prevButton = this.createElement('button', ['controlButton', 'prev']);
        prevButton.innerHTML = `<span class="material-symbols-outlined icon">fast_rewind</span>`;
        this.addEventListener('click', () => {
            this.music.playPrevSong(true);
        }, prevButton);

        const nextButton = this.createElement('button', ['controlButton', 'next']);
        nextButton.innerHTML = `<span class="material-symbols-outlined icon">fast_forward</span>`;
        this.addEventListener('click', () => {
            this.music.playNextSong(true);
        }, nextButton);

        this.renderPlayButton(this.music.status);

        this.addEventListener('click', () => {
            if (this.music.status == 'playing') {
                this.music.pause();
            } else {
                this.music.play();
            }
        }, this.playButton);

        controlContiner.appendChild(prevButton);
        controlContiner.appendChild(this.playButton);
        controlContiner.appendChild(nextButton);

        return controlContiner;
    }

    private renderTimelineControl() {
        const timelineContiner = this.createElement('div', ['timelineContiner']);

        const volumeGroup = this.createElement('div', ['trackSlider']);
        const notiVolume = new TrackSlider(volumeGroup, this.music.time || 0, this.music.duration || 3);

        this.listen('updateTrack', () => {
            notiVolume.max = this.music.duration || 3;
            notiVolume.volume = this.music.time || 0;
        })

        const seekDebounce = debounce((time: number) => {
            this.music.seek(time);
        }, 50);

        notiVolume.addEventListener<number>('change', (value) => {
            seekDebounce(value);
        });

        timelineContiner.appendChild(volumeGroup);
        return timelineContiner;
    }

    private renderPlayButton(status: string) {
        if (status == 'playing') {
            this.playButton.innerHTML = `<span class="material-symbols-outlined icon fill-icon">pause</span>`;
        } else {
            this.playButton.innerHTML = `<span class="material-symbols-outlined icon fill-icon">play_arrow</span>`;
        }
    }
}