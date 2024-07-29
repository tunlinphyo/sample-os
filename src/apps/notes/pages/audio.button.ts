export class AudioButton {
    private audio: HTMLAudioElement;
    private audioButton: HTMLButtonElement;
    private playing: boolean = false;

    constructor(
        private data: string,
        private parentEl: HTMLElement
    ) {
        this.audio = new Audio(this.data);
        this.audioButton = document.createElement("button");
        this.render();
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
        this.updateTimeData(timeData);

        this.audio.addEventListener('loadedmetadata', () => {
            this.updateTimeData(timeData);
        });

        this.audio.addEventListener('timeupdate', () => {
            this.updateTimeData(timeData);
        });

        // this.audio.controls = true;

        this.parentEl.appendChild(this.audio);
        this.parentEl.appendChild(timeData);
        this.parentEl.appendChild(this.audioButton);
    }

    private playAudio() {
        this.audio.play();
        this.playing = true;
        this.audioButton.innerHTML = '<span class="material-symbols-outlined fill-icon">pause</span>'
    }

    private pauseAudio() {
        this.audio.pause();
        this.playing = false;
        this.audioButton.innerHTML = '<span class="material-symbols-outlined fill-icon">play_arrow</span>';
    }

    private updateTimeData(elem: HTMLElement) {
        console.log(this.duration, this.time);
        if (this.duration) {
            elem.textContent = `${this.renderTime(this.time)}/${this.renderTime(this.duration)}`;
        } else {
            elem.textContent = this.renderTime(this.time);
        }
        if (this.duration && this.audio.currentTime === this.audio.duration) {
            this.stopAudio();
        }
    }

    private stopAudio() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.playing = false;
        this.audioButton.innerHTML = '<span class="material-symbols-outlined fill-icon">play_arrow</span>';
    }

    private renderTime({ minutes, seconds }: { minutes: number, seconds: number }) {
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}