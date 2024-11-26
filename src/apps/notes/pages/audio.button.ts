import { AudioController } from "../../../controllers/audio.controller";
import { OSAudio } from "../../../utils/audio";

export class AudioButton {
    private audioButton: HTMLButtonElement;
    private playing: boolean = false;
    private audioId = 'note';
    private audio: OSAudio;
    private _duration: number = 0;

    constructor(
        private data: { url: string, time: number },
        private parentEl: HTMLElement,
        audioController: AudioController
    ) {
        this.audio = audioController.initAudio(this.audioId);
        this.audioButton = document.createElement("button");
        this.render();
        this.init();
    }

    private init() {
    }

    get currentTime() {
        return this.audio.currentTime;
    }
    get duration() {
        const minutes = Math.floor(this._duration / 60);
        const seconds = Math.floor(this._duration % 60);
        return { minutes, seconds };
    }

    get time() {
        const minutes = Math.floor(this.audio.currentTime / 60);
        const seconds = Math.floor(this.audio.currentTime % 60);
        return { minutes, seconds };
    }


    private render() {
        this.audioButton.classList.add('audioPlayer');

        this.audioButton.innerHTML = '<span class="material-symbols-outlined fill-icon">play_arrow</span>';

        this.audioButton.addEventListener('click', () => {
            if (this.playing) {
                this.pauseAudio();
            } else {
                this.audio.play();
            }
        });

        const timeData = document.createElement('div');
        timeData.classList.add("timeData");
        timeData.textContent = 'loading..';

        // Add a custom duration loader: Chrome does not load the duration immediately for base64.
        OSAudio.getMp3Duration(this.data.url).then(duration => {
            this._duration = duration;
            this.updateTimeData(timeData);
        })

        const blob = OSAudio.base64ToBlob(this.data.url, "audio/mp3");
        this.audio.data = URL.createObjectURL(blob);
        this.audio.currentTime = this.data.time;

        // this.audio.e.addEventListener('loadedmetadata', () => {
        //     this.updateTimeData(timeData);
        // });

        this.audio.e.addEventListener('play', () => {
            this.playing = true;
            this.updateTimeData(timeData);
            this.updateButton();
        });
        this.audio.e.addEventListener('pause', () => {
            this.playing = false;
            this.updateTimeData(timeData);
            this.updateButton();
        });
        this.audio.e.addEventListener('timeupdate', () => {
            this.updateTimeData(timeData);
        });
        this.audio.e.addEventListener('ended', () => {
            this.updateTimeData(timeData);
            this.updateButton();
        });

        this.parentEl.appendChild(this.audioButton);
        this.parentEl.appendChild(timeData);
    }

    public pauseAudio() {
        this.audio.pause();
    }

    private updateTimeData(elem: HTMLElement) {
        elem.textContent = `${this.renderTime(this.time)}/${this.renderTime(this.duration)}`;
    }

    private renderTime({ minutes, seconds }: { minutes: number, seconds: number }) {
        return `${minutes.toString()}:${seconds.toString().padStart(2, '0')}`;
    }

    private updateButton() {
        this.audioButton.innerHTML = `<span class="material-symbols-outlined fill-icon">${this.playing ? 'pause' : 'play_arrow'}</span>`;
        if (this.playing) {
        } else {

        }
    }
}