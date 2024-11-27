import { Volume } from "../stores/settings.store";
import { OSAudio } from "../utils/audio";
import { BaseController } from "./base.controller"

export interface Audio {
    id: string;
    type: 'media' | 'noti';
    service: OSAudio;
}

interface AudioVolume {
    media: number;
    noti: number;
}

export class AudioController extends BaseController {
    private audioObject: Record<string, Audio> = {};
    private _volume: AudioVolume = {
        media: 0,
        noti: 0
    };
    private _alertAudio: OSAudio;
    private _textAudio: OSAudio;
    private _ringAudio: OSAudio;
    private _inCall: boolean = false;

    public notiFiles: Record<string, string> = {
       'reflection': '/notifigations/1.mp3',
       'arpeggio': '/notifigations/2.mp3',
       'canopy': '/notifigations/3.mp3',
       'chalet': '/notifigations/4.mp3',
       'daybreak': '/notifigations/5.mp3',
       'buzz': '/ringtones/1.mp3',
       'beats': '/ringtones/2.mp3',
       'groove': '/ringtones/3.mp3',
       'rhythm': '/ringtones/4.mp3',
       'vibe': '/ringtones/5.mp3',
    }

    constructor() {
        super();
        this._alertAudio = this.initAudio('alert');
        this._textAudio = this.initAudio('text');
        this._ringAudio = this.initAudio('ringtone');
        this.init();
    }

    private init() {
        this.alert.e.addEventListener('play', () => {
            if (this.ringtone.status == 'playing') {
                this.alert.volume = 0;
            }
            if (this.music && this.music.status == 'playing') {
                this.music.pause(true);
            }
        });
        this.alert.e.addEventListener('pause', () => {
            if (this.music && this.music.status == 'paused' && this.ringtone.status != 'playing' && !this.inCall) {
                this.music.play(true);
            }
        });
        this.ringtone.e.addEventListener('play', () => {
            this.alert.volume = 0;
            if (this.music && this.music.status == 'playing') {
                this.music.pause(true);
            }
        });
        this.ringtone.e.addEventListener('pause', () => {
            this.alert.volume = this.volume.noti;
            if (this.music && this.music.status == 'paused' && this.alert.status != 'playing' && !this.inCall) {
                this.music.play(true);
            }
        });
        this.text.e.addEventListener('play', () => {
            if (this.music && this.music.status == 'playing') {
                this.music.volume = 0;
            }
        });
        this.text.e.addEventListener('pause', () => {
            if (this.music) {
                this.music.volume = this.volume.media;
            }
        });
        // this.noti.e.addEventListener('ended', () => {
        //     console.log('NOTI_ENDED');
        // });
    }

    get volume(): AudioVolume {
        return this._volume;
    }
    set volume(data: Volume) {
        this._volume = {
            media: data.mediaVolume,
            noti: data.notiVolume,
        };
        Object.values(this.audioObject).forEach(c => {
            let volume = c.type === 'media' ? data.mediaVolume : data.notiVolume;
            c.service.volume = volume;
        });
    }

    get alert() {
        return this._alertAudio;
    }
    get text() {
        return this._textAudio;
    }
    get ringtone() {
        return this._ringAudio;
    }

    get music() {
        const audio = this.audioObject['music'];
        if (!audio) return null;
        return audio.service;
    }

    get inCall() {
        return this._inCall;
    }
    set inCall(data: boolean) {
        this._inCall = data;
        if (data && this.alert && this.alert.status == 'playing') {
            this.alert.pause();
        }
        if (!data && this.music && this.music.status == 'paused' && this.alert.status != 'playing') {
            this.music.play(true);
        }
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

    public playAlert(data: string) {
        const url = this.notiFiles[data];
        if (url) {
            this.alert.playSong(url, 0);
            this.alert.loop = true;
        }
    }
    public stopAlert() {
        this.alert.pause();
    }

    public playText(data: string) {
        const url = this.notiFiles[data];
        if (url) {
            this.text.playSong(url, 0);
            this.text.loop = false;
        }
    }
    public stopText() {
        this.text.pause();
    }

    public playRingtone(data: string) {
        const url = this.notiFiles[data];
        if (url) {
            this.ringtone.playSong(url, 0);
            this.ringtone.loop = true;
        }
    }
    public stopRingtine() {
        this.ringtone.pause();
    }

    public pauseMusic() {
        if (this.music && this.music.status == 'playing') {
            this.music.pause(true);
        }
    }
    public resumeMusic() {
        if (this.music && this.music.status == 'paused') {
            this.music.play(true);
        }
    }
}