import { Page } from "../../../components/page";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Note, NoteData } from "../../../stores/notes.store";
import { NotesController } from "../notes.controller";

export class NotePage extends Page {
    private note: Note | undefined;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private notes: NotesController
    ) {
        super(history, { template: 'scrollTemplate', btnStart: 'delete', btnEnd: 'edit' });
        this.component.classList.add('notePage');
        this.init();
    }

    private init() {
        this.addEventListener('click', async () => {
            if (!this.note) return;
            const result = await this.device.confirmPopup.openPage(
                'Delete Note',
                `Are you sure to delete <br/> ${this.note.title}?`
            );
            if (result) this.notes.deleteNote(this.note.id);
        }, this.btnStart, false);

        this.addEventListener('click', () => {
            if (!this.note) return;
            this.history.pushState('/notes/edit', this.note);
        }, this.btnEnd, false);

        this.notes.addChangeListener((status: string, data: any) => {
            if (status === "NOTE_DELETED") {
                this.closePage();
            } else if (status === "NOTE_SAVED") {
                const note = this.notes.getNote(data);
                if (note) this.update("update", note);
            }
        });
    }

    render(note: Note) {
        this.note = note;
        this.mainArea.scrollTo(0, 0);

        if (note.type === 'note') {
            const noteArea = this.createElement('div', ['noteViewArea']);
            for(const item of note.body) {
                this.renderTextNote(noteArea, item);
            }
            this.mainArea.appendChild(noteArea);
        } else {
            // render AudioNote
        }
    }

    update(_: string, data: Note) {
        if (!this.isActive) return;
        this.removeAllEventListeners();
        this.mainArea.innerHTML = '';
        this.render(data);
    }

    private renderTextNote(noteArea: HTMLElement, item: NoteData) {
        if (item.type === 'title') {
            this.renderTitle(noteArea, item);
        }
        if (item.type === 'paragraph') {
            this.renderParagraph(noteArea, item);
        }
        if (item.type === 'quote') {
            this.renderQuote(noteArea, item);
        }
        if (item.type === 'order-list') {
            this.renderOrderList(noteArea, item);
        }
        if (item.type === 'unorder-list') {
            this.renderUnorderList(noteArea, item);
        }
    }

    private renderTitle(parentEl: HTMLElement, note: NoteData) {
        const sectiion = this.createElement('h2');
        for(const text of note.data) {
            const elem = this.createElement('span');
            elem.textContent = text;
            sectiion.appendChild(elem);
        }
        parentEl.appendChild(sectiion);
    }

    private renderParagraph(parentEl: HTMLElement, note: NoteData) {
        const sectiion = this.createElement('p');
        for(const text of note.data) {
            const elem = this.createElement('span');
            elem.textContent = text;
            sectiion.appendChild(elem);
        }
        parentEl.appendChild(sectiion);
    }

    private renderOrderList(parentEl: HTMLElement, note: NoteData) {
        const sectiion = this.createElement('ol');
        for(const text of note.data) {
            const elem = this.createElement('li');
            elem.textContent = text;
            sectiion.appendChild(elem);
        }
        parentEl.appendChild(sectiion);
    }

    private renderUnorderList(parentEl: HTMLElement, note: NoteData) {
        const sectiion = this.createElement('ul');
        for(const text of note.data) {
            const elem = this.createElement('li');
            elem.textContent = text;
            sectiion.appendChild(elem);
        }
        parentEl.appendChild(sectiion);
    }

    private renderQuote(parentEl: HTMLElement, note: NoteData) {
        const sectiion = this.createElement('blockquote');
        for(const text of note.data) {
            const elem = this.createElement('span');
            elem.textContent = text;
            sectiion.appendChild(elem);
        }
        parentEl.appendChild(sectiion);
    }
}
