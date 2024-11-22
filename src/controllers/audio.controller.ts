import { AudioService } from "../services/audio.service";
import { Volume } from "../stores/settings.store";
import { BaseController } from "./base.controller"

export interface Audio {
    id: string;
    type: 'media' | 'noti';
    service: AudioService;
}

interface audioObject {
    [key: string]: Audio
}

export class AudioController extends BaseController {
    private audioObject: audioObject = {};
    private volume: Volume | null = null;

    constructor() {
        super();
    }

    setVolume(data: Volume) {
        this.volume = data;
        Object.values(this.audioObject).forEach(c => {
            let volume = 1;
            if (this.volume) {
                volume = c.type === 'media' ? this.volume.mediaVolume : this.volume.alarmVolume;
            }
            c.service.setVolume(volume);
        });
    }

    getCurrentTime(id: string) {
        const c = this.audioObject[id];
        if (!c) return 0;
        return c.service.audio.seek();
    }
    getDuration(id: string) {
        const c = this.audioObject[id];
        if (!c) return 0;
        return c.service.audio.duration();
    }

    getStatus(id: string) {
        const c = this.audioObject[id];
        if (!c) return 'noaudio';
        return c.service.status;
    }
    getTime(id: string) {
        const c = this.audioObject[id];
        return {
            time: c.service.getTime() || 0,
            duration: c.service.getDuration() || 0
        }
    }

    addAudio(id: string, audioId: string, url: string, time?: number) {
        const c = this.audioObject[id];
        if (c) {
            if (c.id !== audioId) delete this.audioObject[id];
            else return;
        }
        const type: 'media' | 'noti' = ['music', 'note'].includes(id) ? 'media' : 'noti';

        let volume = 1;
        if (this.volume) {
            volume = type === 'media' ? this.volume.mediaVolume : this.volume.alarmVolume;
        }
        const service = new AudioService(url, volume, time);
        const newAudio = { id: audioId, type, service };
        this.audioObject[id] = newAudio;
    }
    removeAudio(id: string) {
        delete this.audioObject[id];
    }

    play(id: string) {
        const c = this.audioObject[id];
        c.service.audio.play();
    }
    pause(id: string) {
        const c = this.audioObject[id];
        c.service.audio.pause();
    }
    stop(id: string) {
        const c = this.audioObject[id];
        c.service.audio.stop();
    }
    seek(id: string, time: number) {
        const c = this.audioObject[id];
        c.service.audio.seek(time);
    }
    on(id: string, event: string, callback: () => void) {
        const c = this.audioObject[id];
        console.log('ON*****', c);
        if (!c) return;
        c.service.audio.on(event, callback);
    }
}