import { AudioController } from "../../../controllers/audio.controller";
import { OSAudio } from "../../../utils/audio";

export class AudioButton {
    private audioButton: HTMLButtonElement;
    private playing: boolean = false;
    private audioId = 'note';
    private audio: OSAudio;

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
        const minutes = Math.floor(this.audio.duration / 60);
        const seconds = Math.floor(this.audio.duration % 60);
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
                this.playAudio();
            }
        });

        const timeData = document.createElement('div');
        timeData.classList.add("timeData");

        // this.audio.playSong(this.data.url, this.data.time);
        this.audio.data = this.data.url;
        this.audio.currentTime = this.data.time;
        this.updateTimeData(timeData);

        this.audio.e.addEventListener('timeupdate', () => {
            this.updateTimeData(timeData);
        });
        this.audio.e.addEventListener('ended', () => {
            this.updateTimeData(timeData);
            this.stopAudio();
        });

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
        elem.textContent = `${this.renderTime(this.time)}/${this.renderTime(this.duration)}`;
    }

    public stopAudio() {
        this.playing = false;
        this.audioButton.innerHTML = '<span class="material-symbols-outlined fill-icon">play_arrow</span>';
    }

    private renderTime({ minutes, seconds }: { minutes: number, seconds: number }) {
        return `${minutes.toString()}:${seconds.toString().padStart(2, '0')}`;
    }
}