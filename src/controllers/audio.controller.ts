import { Volume } from "../stores/settings.store";
import { OSAudio } from "../utils/audio";
import { BaseController } from "./base.controller";

export interface Audio {
    id: string;
    type: "media" | "noti";
    service: OSAudio;
}

interface AudioVolume {
    media: number;
    noti: number;
}

export class AudioController extends BaseController {
    private audioMap: Record<string, Audio> = {};
    private _volume: AudioVolume = { media: 0, noti: 0 };
    private _alertAudio: OSAudio;
    private _textAudio: OSAudio;
    private _ringAudio: OSAudio;
    private _inCall = false;

    public notiFiles: Record<string, string> = {
        reflection: "/notifications/1.mp3",
        arpeggio: "/notifications/2.mp3",
        canopy: "/notifications/3.mp3",
        chalet: "/notifications/4.mp3",
        daybreak: "/notifications/5.mp3",
        buzz: "/ringtones/1.mp3",
        beats: "/ringtones/2.mp3",
        groove: "/ringtones/3.mp3",
        rhythm: "/ringtones/4.mp3",
        vibe: "/ringtones/5.mp3",
    };

    constructor() {
        super();
        this._alertAudio = this.initAudio("alert");
        this._textAudio = this.initAudio("text");
        this._ringAudio = this.initAudio("ringtone");
        this.setupEventListeners();
    }

    private setupEventListeners() {
        this.setupAudioEvents(this.alert, this.handleAlertPlay.bind(this), this.handleAlertPause.bind(this));
        this.setupAudioEvents(this.ringtone, this.handleRingtonePlay.bind(this), this.handleRingtonePause.bind(this));
        this.setupAudioEvents(this.text, this.handleTextPlay.bind(this), this.handleTextPause.bind(this));
    }

    private setupAudioEvents(audio: OSAudio, onPlay: () => void, onPause: () => void) {
        audio.e.addEventListener("play", onPlay);
        audio.e.addEventListener("pause", onPause);
    }

    private handleAlertPlay() {
        if (this.ringtone.status === "playing") {
            this.alert.volume = 0;
        }
        this.pauseMusicIfPlaying();
    }

    private handleAlertPause() {
        this.resumeMusicIfPossible();
    }

    private handleRingtonePlay() {
        this.alert.volume = 0;
        this.pauseMusicIfPlaying();
    }

    private handleRingtonePause() {
        this.alert.volume = this.volume.noti;
        this.resumeMusicIfPossible();
    }

    private handleTextPlay() {
        if (this.music?.status === "playing") {
            this.music.volume = 0;
        }
    }

    private handleTextPause() {
        if (this.music) {
            this.music.volume = this.volume.media;
        }
    }

    private pauseMusicIfPlaying() {
        if (this.music?.status === "playing") {
            this.music.pause(true);
        }
    }

    private resumeMusicIfPossible() {
        if (
            this.music?.status === "paused" &&
            this.alert.status !== "playing" &&
            this.ringtone.status !== "playing" &&
            !this.inCall
        ) {
            this.music.play(true);
        }
    }

    get volume(): AudioVolume {
        return this._volume;
    }

    set volume(data: Volume) {
        this._volume = { media: data.mediaVolume, noti: data.notiVolume };
        Object.values(this.audioMap).forEach(({ type, service }) => {
            service.volume = type === "media" ? data.mediaVolume : data.notiVolume;
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
        return this.audioMap["music"]?.service || null;
    }

    get inCall() {
        return this._inCall;
    }

    set inCall(value: boolean) {
        this._inCall = value;
        if (value && this.alert.status === "playing") {
            this.alert.pause();
        }
        this.resumeMusicIfPossible();
    }

    public initAudio(id: string): OSAudio {
        if (!this.audioMap[id]) {
            const type: "media" | "noti" = ["music", "note"].includes(id) ? "media" : "noti";
            const service = new OSAudio(id);
            service.volume = this.volume[type];
            this.audioMap[id] = { id, type, service };
        }
        return this.audioMap[id].service;
    }

    public playAlert(name: string) {
        const url = this.notiFiles[name];
        if (url) {
            this.alert.playSong(url, 0);
            this.alert.loop = true;
        }
    }

    public stopAlert() {
        this.alert.pause();
    }

    public playText(name: string) {
        const url = this.notiFiles[name];
        if (url) {
            this.text.playSong(url, 0);
            this.text.loop = false;
        }
    }

    public stopText() {
        this.text.pause();
    }

    public playRingtone(name: string) {
        const url = this.notiFiles[name];
        if (url) {
            this.ringtone.playSong(url, 0);
            this.ringtone.loop = true;
        }
    }

    public stopRingtone() {
        this.ringtone.pause();
    }

    public pauseMusic() {
        if (this.music?.status === "playing") {
            this.music.pause(true);
        }
    }

    public resumeMusic() {
        if (this.music?.status === "paused") {
            this.music.play(true);
        }
    }
}