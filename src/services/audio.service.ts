import { Howl } from "howler";

export type AudioStatus = 'play' | 'pause' | 'stop';

export class AudioService {
    public audio: Howl;
    public status: AudioStatus = 'stop';

    constructor(url: string, volume: number, time: number = 0) {
        this.audio = new Howl({
            src: [url],
            format: ['mp3'],
            volume,
        });
        this.audio.seek(time);

        this.audio.on('play', () => {
            this.status = 'play';
        });
        this.audio.on('pause', () => {
            this.status = 'pause';
        });
        this.audio.on('stop', () => {
            this.status = 'stop';
        });
    }

    getTime() {
        const minutes = Math.floor(this.audio.seek() / 60);
        const seconds = Math.floor(this.audio.seek() % 60);
        return { minutes, seconds };
    }
    getDuration() {
        const minutes = Math.floor(this.audio.duration() / 60);
        const seconds = Math.floor(this.audio.duration() % 60);
        return { minutes, seconds };
    }

    setVolume(volume: number) {
        const max = Math.max(0, volume)
        this.audio.volume(Math.min(1, max))
    }
}