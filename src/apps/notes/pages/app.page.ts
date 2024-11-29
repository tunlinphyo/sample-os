import { App } from "../../../components/app";
import { ScrollBar } from "../../../components/scroll-bar";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Note } from "../../../stores/notes.store";
import { OSDate } from "../../../utils/date";
import { NotesController } from "../notes.controller";


export class NotesApp extends App {
    private scrollBar?: ScrollBar;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private notes: NotesController
    ) {
        super(history, { template: 'actionTemplate', btnCenter: 'add', btnEnd: 'mic' });
        this.component.classList.add('noteListPage')
        this.init();
    }

    private init() {
        this.addEventListener('click', () => {
            this.history.pushState('/notes/new', null);
        }, this.btnCenter, false);


        this.addEventListener('click', () => {
            this.history.pushState('/notes/audio', null);
        }, this.btnEnd, false);

        this.notes.addChangeListener((status: string, data: any) => {
            if (status === 'NOTES_CHANGED') {
                this.update("update", data);
            }
        });
    }

    render(data: Note[]) {
        if (!data.length) return this.renderNoData('Create a Note');

        const list = this.sortByDate(data);
        const scrollArea = this.createScrollArea();
        const noteList = this.createElement('ul', ['noteList']);
        for(const item of list) {
            if (item.type === 'note') {
                this.renderTextNote(noteList, item);
            } else {
                this.renderAudioNote(noteList, item);
            }
        }
        scrollArea.appendChild(noteList);
        this.mainArea.appendChild(scrollArea);
        if (!this.scrollBar) {
            this.scrollBar = new ScrollBar(this.component);
        } else {
            this.scrollBar?.reCalculate();
        }
    }

    update(_: string, data: Note[]) {
        this.mainArea.innerHTML = ''
        this.removeAllEventListeners()
        this.render(data)
    }

    private renderAudioNote(noteList: HTMLElement, item: Note) {
        if (item.type == 'note') return;

        const noteTitle = this.createElement('li', ['noteCard']);
        const titleEl = this.createElement('div', ['noteTitle']);
        titleEl.textContent = item.title || 'Untitled note';
        noteTitle.appendChild(titleEl);

        const nootFooter = this.createElement('div', ['noteFooter']);

        const dateEl = this.createElement('small', ['noteDate']);
        dateEl.textContent = OSDate.formatDate(item.updateDate || item.createDate, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            weekday: 'short'
        }, this.device.timeZone);
        nootFooter.appendChild(dateEl);

        const iconEl = this.createElement('span', ['material-symbols-outlined', 'icon']);
        iconEl.textContent = 'graphic_eq';
        nootFooter.appendChild(iconEl);

        noteTitle.appendChild(nootFooter);

        this.addEventListener('click', () => {
            this.history.pushState('/notes/audio', item);
        }, noteTitle)
        noteList.appendChild(noteTitle);
    }

    private renderTextNote(noteList: HTMLElement, item: Note) {
        if (item.type == 'audio') return;

        const noteTitle = this.createElement('li', ['noteCard']);
        const titleEl = this.createElement('div', ['noteTitle']);
        titleEl.textContent = item.title;
        noteTitle.appendChild(titleEl);

        const nootFooter = this.createElement('div', ['noteFooter']);

        const dateEl = this.createElement('small', ['noteDate']);
        dateEl.textContent = OSDate.formatDate(item.updateDate || item.createDate, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            weekday: 'short'
        }, this.device.timeZone);
        nootFooter.appendChild(dateEl);

        const iconEl = this.createElement('span', ['material-symbols-outlined', 'icon']);
        iconEl.textContent = 'sticky_note_2';
        nootFooter.appendChild(iconEl);

        noteTitle.appendChild(nootFooter);

        this.addEventListener('click', () => {
            this.history.pushState('/notes/detail', item.id);
        }, noteTitle)
        noteList.appendChild(noteTitle);
    }

    private sortByDate(notes: Note[]): Note[] {
        return notes.sort((a, b) => {
            const dateA = a.updateDate || a.createDate;
            const dateB = b.updateDate || b.createDate;
            return dateB.getTime() - dateA.getTime();
        })
    }
}
