export class OSAudio {
    private audio: HTMLAudioElement;
    private _loading: boolean = true;
    private audioContext: AudioContext;
    private gainNode: GainNode;
    private _forcedPaused: boolean = false;

    constructor(private audioId: string) {
        this.audio = this.createAudio(audioId);
        this.eventListeners();
        document.body.appendChild(this.audio);

        this.audioContext = new ((window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext)();
        const track = this.audioContext.createMediaElementSource(this.audio);
        this.gainNode = this.audioContext.createGain();
        track.connect(this.gainNode).connect(this.audioContext.destination);
    }

    // Public Getters and Setters
    get id() {
        return this.audioId;
    }

    get e() {
        return this.audio;
    }

    get loaded() {
        return !this._loading;
    }

    set data(data: string) {
        this.audio.src = data;
        this.audio.preload = 'metadata';
        this._loading = false;
    }

    get currentTime() {
        return this.audio.currentTime || 0;
    }

    set currentTime(time: number) {
        this.audio.currentTime = time;
    }

    get duration() {
        if (this.audio.duration == Infinity) return 0;
        return this.audio.duration || 0;
    }

    get volume() {
        return this.gainNode.gain.value;
    }

    set volume(volume: number) {
        this.gainNode.gain.value = volume;
    }

    set loop(data: boolean) {
        this.audio.loop = data;
    }

    get status() {
        if (this.audio.ended) return "ended";
        if (this.audio.paused) return "paused";
        return "playing";
    }

    // Event Listeners
    private eventListeners() {
        this.audio.addEventListener('ended', () => {
            this.audio.currentTime = 0;
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.status == 'playing') {
                this.audio.play().catch((error) => {
                    console.error('Playback error:', error);
                });
            }
        });
    }

    private createAudio(id: string) {
        const existingElem = document.getElementById(id) as HTMLAudioElement;
        if (existingElem) return existingElem;

        const newElem = new Audio();
        newElem.id = id;
        return newElem;
    }

    // Public Methods
    public play(forced: boolean = false) {
        if (!forced || (forced && this._forcedPaused)) {
            this.audioContext.resume().catch((err) => console.error("AudioContext resume error:", err));
            this.audio.play().catch((err) => console.error("Audio play error:", err));
        }
    }

    public pause(forced: boolean = false) {
        this._forcedPaused = forced;
        this.audio.pause();
    }

    public playSong(data: string, initTime: number = 0, volume?: number) {
        this.data = data;
        this.currentTime = initTime;
        if (volume !== undefined) this.volume = volume;
        this.play();
    }

    public destroy() {
        this.audio.pause();
        this.audio.src = "";
        this.audio.remove();

        this.audioContext.close().catch((err) => console.error("AudioContext close error:", err));
        this.audio = null!;
        this.audioContext = null!;
    }

    public static base64ToBlob(base64: string, mimeType: string): Blob {
        const byteCharacters = atob(base64.split(',')[1]);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length).fill(0).map((_, i) => slice.charCodeAt(i));
            byteArrays.push(new Uint8Array(byteNumbers));
        }
        return new Blob(byteArrays, { type: mimeType });
    }

    public static async getMp3Duration(base64Mp3: string): Promise<number> {
        try {
            const base64Data = base64Mp3.split(',')[1];
            const binaryData = atob(base64Data);
            const len = binaryData.length;
            const uint8Array = new Uint8Array(len);

            for (let i = 0; i < len; i++) {
                uint8Array[i] = binaryData.charCodeAt(i);
            }

            const audioContext = new AudioContext();
            const audioBuffer = await audioContext.decodeAudioData(uint8Array.buffer);
            return audioBuffer.duration;
        } catch (error) {
            console.error('Error decoding MP3:', error);
            return 0;
        }
    }
}