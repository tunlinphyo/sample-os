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

export class AudioController extends BaseController {
    private audioObject: audioObject = {};

    constructor() {
        super();
    }

    set volume(data: Volume) {
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
            this.audioObject[id] = newAudio;
            return newAudio.service;
        }
    }
}