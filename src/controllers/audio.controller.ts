import { Volume } from "../stores/settings.store";
import { OSAudio } from "../utils/audio";
import { BaseController } from "./base.controller"

export interface Audio {
    id: string;
    type: 'media' | 'noti';
    service: OSAudio;
}

interface audioObject {
    [key: string]: Audio
}

interface AudioVolume {
    media: number;
    noti: number;
}

export class AudioController extends BaseController {
    private audioObject: audioObject = {};
    private _volume: AudioVolume = {
        media: 0,
        noti: 0
    };

    constructor() {
        super();
    }

    get volume(): AudioVolume {
        return this._volume;
    }
    set volume(data: Volume) {
        this._volume = {
            media: data.mediaVolume,
            noti: data.alarmVolume,
        };
        Object.values(this.audioObject).forEach(c => {
            let volume = c.type === 'media' ? data.mediaVolume : data.alarmVolume;
            c.service.volume = volume;
        });
    }

    initAudio(id: string) {
        const audio = this.audioObject[id];
        if (audio) {
            return audio.service;
        } else {
            const type: 'media' | 'noti' = ['music', 'note'].includes(id) ? 'media' : 'noti';
            const newAudio: Audio = {
                id,
                type,
                service: new OSAudio(id)
            }
            newAudio.service.volume = this.volume[type];
            this.audioObject[id] = newAudio;
            return newAudio.service;
        }
    }
}