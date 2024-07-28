import { Modal } from "../../../components/modal";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Note } from "../../../stores/notes.store";
import { NotesController } from "../notes.controller";
import { MediaRecorderService } from "../services/media.recorder";

export class AudioRecoder extends Modal {
    private mediaService: MediaRecorderService;
    private note: Note | undefined;
    private canvasEl: HTMLCanvasElement;
    private recordButton: HTMLButtonElement;

    private pressTimer: number | undefined;
    private recording: boolean = false;
    private support: boolean = false;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private notes: NotesController
    ) {
        super(history, {});

        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);

        this.canvasEl = this.createElement<HTMLCanvasElement>('canvas', ['audioCanvas']);
        this.recordButton = this.createElement('button', ['recoderButton']);
        this.mediaService = new MediaRecorderService(this.canvasEl);
        this.init();
        console.log(this.notes);
    }

    private init() {
        this.mediaService.addChangeListener((status: string, message: string) => {
            if (status === "LOADED") {
                if (message) {
                    console.log(status, message);
                    this.renderNotSupport(message);
                    this.support = false;
                } else {
                    this.support = true;
                }
            }
        });

        this.listen('pageClose', () => {
            if (this.mediaService) {
                this.mediaService.stopMediaTracks();
            }
        });

        // Touch events
        this.recordButton.addEventListener('touchstart', this.startRecording);
        this.recordButton.addEventListener('touchend', this.stopRecording);
        this.recordButton.addEventListener('touchmove', this.stopRecording); 

        this.recordButton.addEventListener('mousedown', this.startRecording);
        this.recordButton.addEventListener('mouseup', this.stopRecording);
        this.recordButton.addEventListener('mousemove', this.stopRecording);

        this.recordButton.addEventListener('pointercancel', this.stopRecording);
    }

    render(data?: Note) {
        if (data) this.note = data;
        else {
            this.note = {
                id: '',
                type: 'audio',
                title: '',
                body: '',
                createDate: new Date(),
                deleted: false,
            }
        }

        this.mediaService.init();

        if (!this.note.body) {
            this.createRecoder();
        }
    }

    update() { }

    private startRecording(event: Event) {
        event.preventDefault();
            
        this.pressTimer = setTimeout(() => {
            if (!this.support) {
                this.device.alertPopup.openPage('Alert', this.mediaService.message);
            } else {
                this.recording = true;
                this.recordButton?.classList.add("recording");
            }
            console.log('Press and hold action triggered');
        }, 300);
    }

    private stopRecording() {
        if (this.pressTimer) {
            if (this.recording) {
                this.recording = false;
                console.log('Press and hold action END');
                this.recordButton?.classList.remove("recording");
            }
            clearTimeout(this.pressTimer);
        }
    }

    private createRecoder() {
        this.removeAllEventListeners();
        this.mainArea.innerHTML = "";
        const flexCenter = this.createFlexCenter();

        this.recordButton.innerHTML = '<span class="material-symbols-outlined fill-icon">mic</span>'

        const messageEl = this.createElement('div', ['message']);
        messageEl.textContent = 'Press and hold to record.';

        flexCenter.appendChild(messageEl);
        flexCenter.appendChild(this.recordButton);
        this.mainArea.appendChild(flexCenter);
    }

    private renderNotSupport(message: string) {
        this.removeAllEventListeners();
        this.mainArea.innerHTML = "";
        const flexCenter = this.createFlexCenter();

        const messageEl = this.createElement('div', ['message']);
        messageEl.textContent = message;

        flexCenter.appendChild(messageEl);
        this.mainArea.appendChild(flexCenter);
    }
}