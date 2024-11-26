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
    private _notiAudio: OSAudio;

    public notiFiles: { [key: string]: string } = {
       'reflection': '/notifigations/1.mp3',
       'arpeggio': '/notifigations/2.mp3',
       'canopy': '/notifigations/3.mp3',
       'chalet': '/notifigations/4.mp3',
       'daybreak': '/notifigations/5.mp3', 
    }

    constructor() {
        super();

        this._notiAudio = this.initAudio('noti');
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

    get noti() {
        return this._notiAudio;
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