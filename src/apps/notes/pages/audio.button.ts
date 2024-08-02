import { SettingsController } from "../../../controllers/settings.controller";

export class AudioButton {
    private audio: HTMLAudioElement;
    private audioButton: HTMLButtonElement;
    private playing: boolean = false;

    constructor(
        private data: string,
        private parentEl: HTMLElement,
        private setting: SettingsController
    ) {
        this.audio = new Audio(this.data);
        this.audioButton = document.createElement("button");
        this.render();
        this.init();
    }

    private init() {
        this.setting.addChangeListener((status: string) => {
            if (status === 'UPDATE_VOLUMES') {
                this.audio.volume = this.setting.volumes.mediaVolume || 1
            }
        });
    }

    get duration() {
        if (this.audio.duration === Infinity) return null
        const minutes = Math.floor(this.audio.duration / 60);
        const seconds = Math.floor(this.audio.duration % 60);
        return { minutes, seconds };
    }

    get time() {
        const minutes = Math.floor(this.audio.currentTime / 60);
        const seconds = Math.floor(this.audio.currentTime % 60);
        return { minutes, seconds };
    }

    get currentTime() {
        return this.audio.currentTime
    }
    set currentTime(time: number) {
        this.audio.currentTime = time;
    }

    private render() {
        this.audioButton.classList.add('audioPlayer');

        this.audioButton.innerHTML = '<span class="material-symbols-outlined fill-icon">play_arrow</span>';

        this.audioButton.addEventListener('click', () => {
            this.audio.volume = this.setting.volumes.mediaVolume || 1;
            if (this.playing) {
                this.pauseAudio();
            } else {
                this.playAudio();
            }
        });

        const timeData = document.createElement('div');
        timeData.classList.add("timeData");
        this.updateTimeData(timeData);

        this.audio.addEventListener('loadedmetadata', () => {
            this.updateTimeData(timeData);
        });

        this.audio.addEventListener('timeupdate', () => {
            this.updateTimeData(timeData);
        });

        this.parentEl.appendChild(this.audio);
        this.parentEl.appendChild(this.audioButton);
        this.parentEl.appendChild(timeData);
    }

    private playAudio() {
        this.audio.play();
        this.playing = true;
        this.audioButton.innerHTML = '<span class="material-symbols-outlined fill-icon">pause</span>'
    }

    public pauseAudio() {
        this.audio.pause();
        this.playing = false;
        this.audioButton.innerHTML = '<span class="material-symbols-outlined fill-icon">play_arrow</span>';
    }

    private updateTimeData(elem: HTMLElement) {
        if (this.duration) {
            elem.textContent = `${this.renderTime(this.time)}/${this.renderTime(this.duration)}`;
        } else {
            elem.textContent = this.renderTime(this.time);
        }
        if (this.duration && this.audio.currentTime === this.audio.duration) {
            this.stopAudio();
        }
    }

    public stopAudio() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.playing = false;
        this.audioButton.innerHTML = '<span class="material-symbols-outlined fill-icon">play_arrow</span>';
    }

    private renderTime({ minutes, seconds }: { minutes: number, seconds: number }) {
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}