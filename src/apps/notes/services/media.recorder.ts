import { BaseController } from "../../../controllers/base.controller";


interface Audio {
    id: string;
    title: string;
    audio: string;
    createDate: Date;
    updateDate?: Date;
}

export class MediaRecorderService extends BaseController {
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private audioBlob: Blob | null = null;
    private audioContext: AudioContext | null = null;
    private canvas: HTMLCanvasElement;
    private canvasContext: CanvasRenderingContext2D | null = null;
    private animationId: number | null = null;
    private mediaStream: MediaStream | null = null;

    public message: string = '';

    constructor(canvas: HTMLCanvasElement) {
        super();
        this.canvas = canvas;
        this.canvasContext = canvas.getContext('2d');
    }

    public async init() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                this.mediaStream = stream;
                this.mediaRecorder = new MediaRecorder(stream);

                this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
                    this.audioChunks.push(event.data);
                };

                this.mediaRecorder.onstop = () => {
                    this.audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                    this.audioChunks = [];
                    this.stopMediaTracks();
                };
                this.notifyListeners('LOADED', '');
            } catch (err) {
                console.error('Error accessing microphone: ', err);
                this.message = 'Error accessing microphone!';
                this.notifyListeners('LOADED', this.message);
            }
        } else {
            this.message = 'Your browser does not support audio recording.';
            this.notifyListeners('LOADED', this.message);
        }
    }

    public startRecording(): void {
        if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
            this.mediaRecorder.start();
        }
    }

    public stopRecording(): void {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }
    }

    public stopMediaTracks(): void {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
    }

    public saveRecording(): void {
        if (this.audioBlob) {
            const reader = new FileReader();
            reader.onload = () => {
                const data = reader.result;
                return { audio: data as string };
            };
            reader.readAsDataURL(this.audioBlob);
        } else {
            console.error('No audio recording available to save.');
        }
    }

    public playbackRecording(data: Audio): void {
        const audio = new Audio(data.audio);
        audio.play();
    }

    public setupAudioContext(audio: HTMLAudioElement): void {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const source = this.audioContext.createMediaElementSource(audio);
        const analyser = this.audioContext.createAnalyser();
        source.connect(analyser);
        analyser.connect(this.audioContext.destination);

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            if (!this.canvasContext || !analyser) return;

            this.animationId = requestAnimationFrame(draw);

            analyser.getByteFrequencyData(dataArray);

            this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);

            const barWidth = (this.canvas.width / bufferLength) * 2.5;
            let barHeight: number;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2;

                this.canvasContext.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
                this.canvasContext.fillRect(x, this.canvas.height - barHeight / 2, barWidth, barHeight);

                x += barWidth + 1;
            }
        };

        draw();

        audio.onended = () => {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
            this.canvasContext?.clearRect(0, 0, this.canvas.width, this.canvas.height);
        };
    }

}