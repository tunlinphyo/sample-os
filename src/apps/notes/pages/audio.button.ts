import { AudioController } from "../../../controllers/audio.controller";

export class AudioButton {
    private audioButton: HTMLButtonElement;
    private playing: boolean = false;
    private audioId = 'note';

    constructor(
        private data: { id: string, url: string, time: number },
        private parentEl: HTMLElement,
        private audio: AudioController
    ) {
        this.audioButton = document.createElement("button");
        this.render();
        this.init();
    }

    private init() {
    }

    get currentTime() {
        console.log('GET_CURRENT_TIME', this.audio.getCurrentTime(this.audioId))
        return this.audio.getCurrentTime(this.audioId)
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

        this.audio.addAudio(this.audioId, this.data.id, this.data.url, this.data.time);
        const status = this.audio.getStatus(this.audioId);
        let interval:number;
        this.updateTimeData(timeData);

        if (status == 'play') {
            this.playAudio(false);
            interval = setInterval(() => {
                this.updateTimeData(timeData);
            }, 500)
        }

        this.audio.on(this.audioId, 'play', () => {
            this.updateTimeData(timeData);
            interval = setInterval(() => {
                this.updateTimeData(timeData);
            }, 500)
        })
        this.audio.on(this.audioId, 'pause', () => {
            this.updateTimeData(timeData);
            clearInterval(interval);
        })
        this.audio.on(this.audioId, 'end', () => {
            this.updateTimeData(timeData);
            clearInterval(interval);
            this.stopAudio()
        });

        this.parentEl.appendChild(this.audioButton);
        this.parentEl.appendChild(timeData);
    }

    private playAudio(player: boolean = true) {
        if (player) this.audio.play(this.audioId);
        this.playing = true;
        this.audioButton.innerHTML = '<span class="material-symbols-outlined fill-icon">pause</span>'
    }

    public pauseAudio() {
        this.audio.pause(this.audioId);
        this.playing = false;
        this.audioButton.innerHTML = '<span class="material-symbols-outlined fill-icon">play_arrow</span>';
    }

    private updateTimeData(elem: HTMLElement) {
        const data = this.audio.getTime(this.audioId)
        elem.textContent = `${this.renderTime(data.time)}/${this.renderTime(data.duration)}`;
    }

    public stopAudio() {
        this.playing = false;
        this.audioButton.innerHTML = '<span class="material-symbols-outlined fill-icon">play_arrow</span>';
    }

    private renderTime({ minutes, seconds }: { minutes: number, seconds: number }) {
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}