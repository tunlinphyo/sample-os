export class OSAudio {
    private audio: HTMLAudioElement;
    private _loading: boolean = true;
    private playing: boolean = false;
    private audioContext: AudioContext;
    private gainNode: GainNode;

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
        this._loading = false;
    }

    get currentTime() {
        return this.audio.currentTime;
    }

    set currentTime(time: number) {
        this.audio.currentTime = time;
    }

    get duration() {
        return this.audio.duration;
    }

    get volume() {
        return this.gainNode.gain.value;
    }

    set volume(volume: number) {
        this.gainNode.gain.value = volume;
    }

    get status() {
        if (this.audio.ended) return "ended";
        if (this.audio.paused) return "paused";
        return "playing";
    }

    // Event Listeners
    private eventListeners() {
        this.audio.addEventListener('ended', () => {
            this.playing = false;
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.playing) {
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
    public play() {
        this.playing = true;
        this.audioContext.resume().catch((err) => console.error("AudioContext resume error:", err));
        this.audio.play().catch((err) => console.error("Audio play error:", err));
    }

    public pause() {
        this.playing = false;
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
}