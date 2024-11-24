import { Keyboard } from "../../../components/keyboard";
import { noteTitles } from "../../../components/keyboard/consts";
import { Modal } from "../../../components/modal";
// import { SettingsController } from "../../../controllers/settings.controller.ts";
import { AudioController } from "../../../controllers/audio.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { AudioData, Note } from "../../../stores/notes.store";
import { NotesController } from "../notes.controller";
import { MediaRecorderService } from "../services/media.recorder";
import { AudioButton } from "./audio.button.ts";
import { v4 as uuidv4 } from 'uuid';

export class AudioRecoder extends Modal {
    private mediaService: MediaRecorderService;
    private note: Note | undefined;
    private recordButton: HTMLButtonElement;

    private pressTimer: number | undefined;
    private recording: boolean = false;
    private audio?: AudioButton;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private audioController: AudioController,
        // private setting: SettingsController,
        private notes: NotesController,
    ) {
        super(history, { btnStart: 'mic', btnEnd: 'check' });
        this.component.classList.add('audioRecoderPage');
        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);

        this.recordButton = this.createElement('button', ['recoderButton']);
        this.mediaService = new MediaRecorderService();
        this.init();
    }

    private init() {
        this.listen('pageClose', () => {
            if (this.mediaService) {
                this.mediaService.stopMediaTracks();
                if (this.audio) {
                    this.audio.pauseAudio();
                    if (this.note) this.notes.updateTime(this.note.id, this.audio.currentTime);
                }
            }
        });

        this.addEventListener('click', async () => {
            if (this.note) {
                const result = await this.device.confirmPopup.openPage('Rerecord', 'Are you sure to clear current record!');
                if (result) {
                    this.note.body = {
                        id: uuidv4(),
                        audio: '',
                        currentTime: 0
                    };
                    this.createRecoder();
                }
            }
        }, this.btnStart, false);

        this.addEventListener('click', async () => {
            if (this.note && this.note.body) {
                const type = this.btnEnd?.dataset.type;
                if (type == "delete") {
                    const result = await this.device.confirmPopup.openPage(
                        'Delete Note',
                        `Are you sure to delete <br/> ${this.note.title || 'Untitle note'}?`
                    );
                    if (result) this.notes.deleteNote(this.note.id);
                } else {
                    this.notes.saveNote(this.note);
                }
            }
        }, this.btnEnd, false);

        // Touch events
        this.recordButton.addEventListener('touchstart', this.startRecording);
        this.recordButton.addEventListener('touchend', this.stopRecording);
        // this.recordButton.addEventListener('touchmove', this.stopRecording);

        this.recordButton.addEventListener('mousedown', this.startRecording);
        this.recordButton.addEventListener('mouseup', this.stopRecording);
        // this.recordButton.addEventListener('mousemove', this.stopRecording);

        this.recordButton.addEventListener('pointercancel', this.stopRecording);

        this.notes.addChangeListener((status: string) => {
            if (status === "NOTE_SAVED" || status === "NOTE_DELETED") {
                this.closePage();
            }
        });

        this.device.addEventListener('closeApp', () => {
            if (this.note) {
                if (this.audio) {
                    (this.note.body as AudioData).currentTime = this.audio.currentTime;
                    this.notes.updateTime(this.note.id, this.audio.currentTime);
                    this.audio.pauseAudio();
                }
                this.history.updateState(`/notes/audio`, this.note);
            }
        });
    }

    render(data?: Note) {
        if (data) this.note = data;
        else {
            this.note = {
                id: '',
                type: 'audio',
                title: '',
                body: {
                    id: uuidv4(),
                    audio: '',
                    currentTime: 0
                },
                createDate: new Date(),
                deleted: false,
            }
        }

        if (!(this.note.body as AudioData).audio) {
            this.createRecoder();
        } else {
            this.createAudioPlayer(this.note.body as AudioData);
        }
    }

    update() { }

    private startRecording(event: Event) {
        event.preventDefault();

        this.pressTimer = setTimeout(async () => {
            const result = await this.mediaService.init();
            if (!result) {
                this.device.alertPopup.openPage('Error', this.mediaService.message);
            } else {
                this.recording = true;
                this.device.micNoti(this.recording);
                this.recordButton?.classList.add("recording");
                this.mediaService.startRecording();
            }
            console.log('Press and hold action triggered');
        }, 300);
    }

    private stopRecording() {
        if (this.pressTimer) {
            if (this.recording) {
                this.recording = false;
                this.device.micNoti(this.recording);
                console.log('Press and hold action END');
                this.recordButton?.classList.remove("recording");
                this.mediaService.stopRecording();
                setTimeout(async () => {
                    const result = await this.mediaService.saveRecording();
                    if (result && this.note) {
                        const audioData = {
                            id: uuidv4(),
                            audio: result,
                            currentTime: 0,
                        };
                        this.note.body = audioData
                        this.createAudioPlayer(audioData, false);
                    }
                },300);
            }
            clearTimeout(this.pressTimer);
        }
    }

    private createAudioPlayer(data: AudioData, saved: boolean = true) {
        this.removeAllEventListeners();
        this.mainArea.innerHTML = "";
        const flexCenter = this.createFlexCenter();

        const titleButton = this.createElement('button', ['titleInput']);
        titleButton.textContent = this.note?.title || 'Untitle note';

        this.addEventListener('click', () => {
            if (!this.note) return;
            const keyboardConfig: Keyboard = {
                label: 'Title',
                defaultValue: this.note?.title ?? '',
                type: 'text',
                keys: noteTitles,
                btnEnd: 'check',
            };
            this.device.keyboard.open(keyboardConfig).then(data => {
                if (data && this.note) {
                    this.note.title = data;
                    titleButton.textContent = data || 'Untitle note';
                }
            });
        }, titleButton);
        flexCenter.appendChild(titleButton);

        // const url = this.note?.title == 'Timeless Wisdom' ? '/music/Death Grips - Get Got.mp3' : '/music/Death Grips - Blackjack.mp3'
        // this.audio = new AudioButton({
        //     id: data.id,
        //     url: data.audio,
        //     time: data.currentTime
        // }, flexCenter, this.osaudio);
        this.audio = new AudioButton({ url: data.audio, time: data.currentTime }, flexCenter, this.audioController)

        this.mainArea.appendChild(flexCenter);
        this.toggleActions(false, saved);
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
        this.toggleActions(true);
    }

    private toggleActions(hide: boolean, saved: boolean = false) {
        try {
            const btnStart = this.getElement('.actionButton.start', this.component);
            const btnEnd = this.getElement('.actionButton.end', this.component);
            if (hide) {
                btnStart.classList.add('hide');
                btnEnd.classList.add('hide');
            } else {
                if (saved) {
                    btnEnd.parentElement?.classList.add("reverse");
                    // btnStart.innerHTML = `<span class="material-symbols-outlined icon">edit</span>`;
                    btnEnd.innerHTML = `<span class="material-symbols-outlined icon">delete</span>`;
                    btnEnd.dataset.type = "delete";
                } else {
                    btnEnd.parentElement?.classList.remove("reverse");
                    // btnStart.innerHTML = `<span class="material-symbols-outlined icon">mic</span>`;
                    btnEnd.innerHTML = `<span class="material-symbols-outlined icon">check</span>`;
                    btnEnd.dataset.type = "save";
                }
                btnStart.classList.remove('hide');
                btnEnd.classList.remove('hide');
            }
        } catch (error) {}
    }
}
