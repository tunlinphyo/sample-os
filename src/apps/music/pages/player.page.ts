import { Modal } from "../../../components/modal";
import { MusicController } from "../../../controllers/music.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { TrackSlider } from "../../notes/pages/track.slider";

export class MusicPlayer extends Modal {
    private playButton: HTMLButtonElement;
    private interval: number = 0;

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
                console.log('SONG_PLAY_STATUS', data);
                this.renderPlayButton(data);
                if (data === 'play') {
                    this.interval = setInterval(() => {
                        this.dispatchCustomEvent('updateTrack');
                    }, 1000);
                } else {
                    clearInterval(this.interval);
                }
            }
        };

        this.music.addChangeListener(musicListener);

        this.device.addEventListener('closeApp', () => {
            this.music.removeChangeListener(musicListener);
        });
    }

    render() {
        console.log('PLAYING', this.music.currentSong);
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

        const infoContiner = this.createElement('div', ['infoContainer']);
        const controlContiner = this.renderControl();
        const timelineContiner = this.renderTimelineControl();

        container.appendChild(infoContiner);
        container.appendChild(controlContiner);
        container.appendChild(timelineContiner);

        return container;
    }

    private renderControl() {
        const controlContiner = this.createElement('div', ['controlContainer']);

        const prevButton = this.createElement('button', ['controlButton', 'prev']);
        prevButton.innerHTML = `<span class="material-symbols-outlined icon">fast_rewind</span>`;

        const nextButton = this.createElement('button', ['controlButton', 'next']);
        nextButton.innerHTML = `<span class="material-symbols-outlined icon">fast_forward</span>`;

        this.renderPlayButton(this.music.status);

        this.addEventListener('click', () => {
            const status = this.playButton.dataset.status;
            if (status == 'play') {
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
        const notiVolume = new TrackSlider(volumeGroup, this.music.time, this.music.duration);

        this.listen('updateTrack', () => {
            notiVolume.volume = this.music.time
        })

        notiVolume.addEventListener<number>('change', (value) => {
            console.log('SEEK', value)
        });

        timelineContiner.appendChild(volumeGroup);
        return timelineContiner;
    }

    private renderPlayButton(status: string) {
        if (status == 'play') {
            this.playButton.dataset.status = 'play';
            this.playButton.innerHTML = `<span class="material-symbols-outlined icon fill-icon">pause</span>`;
        } else {
            this.playButton.dataset.status = 'pause';
            this.playButton.innerHTML = `<span class="material-symbols-outlined icon fill-icon">play_arrow</span>`;
        }
    }
}