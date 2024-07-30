export class MediaRecorderService {
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private audioBlob: Blob | null = null;
    private mediaStream: MediaStream | null = null;

    public message: string = '';

    constructor() {}

    public init() {
        return new Promise(async (resolve) => {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    this.mediaStream = stream;
                    this.mediaRecorder = new MediaRecorder(stream);

                    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
                        this.audioChunks.push(event.data);
                    };

                    this.mediaRecorder.onstop = () => {
                        this.audioBlob = new Blob(this.audioChunks, { type: 'audio/mp3' });
                        this.audioChunks = [];
                        this.stopMediaTracks();
                    };
                    resolve(true);
                } catch (err) {
                    console.error('Error accessing microphone: ', err);
                    this.message = 'Error accessing microphone!';
                    resolve(false);
                }
            } else {
                this.message = 'Your browser does not support audio recording.';
                resolve(false);
            }
        })
    }

    public startRecording() {
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

    public saveRecording(): Promise<string | null> {
        return new Promise(resolve => {
            if (this.audioBlob) {
                const reader = new FileReader();
                reader.onload = () => {
                    const data = reader.result;
                    resolve(data as string);
                };
                reader.readAsDataURL(this.audioBlob);
            } else {
                resolve(null);
                console.error('No audio recording available to save.');
            }
        })
    }
}