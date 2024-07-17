import { Page } from "../../../components/page";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Journal, JournalData } from "../../../stores/journal.store";
import { JournalController } from "../journal.controller";

export class JournalPage extends Page {
    private note: Journal | undefined;
    constructor(
        history: HistoryStateManager,
        private journal: JournalController,
        private device: DeviceController
    ) {
        super(history, { template: 'scrollTemplate', btnStart: 'delete', btnEnd: 'edit' })
        this.init()
    }

    private init() {
        this.addEventListener('click', async () => {
            if (!this.note) return;
            const result = await this.device.confirmPopup.openPage(
                'Delete Note',
                `Are you sure to delete <br/> ${this.note.title}?`
            );
            if (result) this.journal.deleteJournal(this.note.id);
        }, this.btnStart, false);

        this.addEventListener('click', () => {
            if (!this.note) return;
            this.history.pushState('/journal/edit', this.note);
        }, this.btnEnd, false);


        this.journal.addChangeListener((status: string, data: any) => {
            if (status === "JOURNAL_DELETED") {
                this.closePage();
            } else if (status === "JOURNAL_SAVED") {
                const note = this.journal.getJournalById(data);
                if (note) this.update("update", note);
            }
        });
    }

    render(note: Journal) {
        this.note = note;
        this.mainArea.scrollTo(0, 0);

        const noteArea = this.createElement('div', ['noteViewArea']);

        for(const item of note.body) {
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

        this.mainArea.appendChild(noteArea);
    }

    update(_: string, data: Journal) {
        if (!this.isActive) return;
        this.removeAllEventListeners();
        this.mainArea.innerHTML = '';
        this.render(data);
    }

    private renderTitle(parentEl: HTMLElement, note: JournalData) {
        const sectiion = this.createElement('h2');
        for(const text of note.data) {
            const elem = this.createElement('span');
            elem.textContent = text;
            sectiion.appendChild(elem);
        }
        parentEl.appendChild(sectiion);
    }

    private renderParagraph(parentEl: HTMLElement, note: JournalData) {
        const sectiion = this.createElement('p');
        for(const text of note.data) {
            const elem = this.createElement('span');
            elem.textContent = text;
            sectiion.appendChild(elem);
        }
        parentEl.appendChild(sectiion);
    }

    private renderOrderList(parentEl: HTMLElement, note: JournalData) {
        const sectiion = this.createElement('ol');
        for(const text of note.data) {
            const elem = this.createElement('li');
            elem.textContent = text;
            sectiion.appendChild(elem);
        }
        parentEl.appendChild(sectiion);
    }

    private renderUnorderList(parentEl: HTMLElement, note: JournalData) {
        const sectiion = this.createElement('ul');
        for(const text of note.data) {
            const elem = this.createElement('li');
            elem.textContent = text;
            sectiion.appendChild(elem);
        }
        parentEl.appendChild(sectiion);
    }

    private renderQuote(parentEl: HTMLElement, note: JournalData) {
        const sectiion = this.createElement('blockquote');
        for(const text of note.data) {
            const elem = this.createElement('span');
            elem.textContent = text;
            sectiion.appendChild(elem);
        }
        parentEl.appendChild(sectiion);
    }
}
