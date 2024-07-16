import { App } from "../../../components/app";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Note } from "../../../stores/notes.store";
import { OSDate } from "../../../utils/date";
import { NotesController } from "../notes.controller";


export class NotesApp extends App {
    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private notes: NotesController
    ) {
        super(history, { template: 'actionTemplate', btnEnd: 'add' });
        this.init();
    }

    private init() {
        this.addEventListener('click', () => {
            this.history.pushState('/notes/new', null);
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
        const noteList = this.createElement('ul', ['titleList']);
        for(const item of list) {
            const noteTitle = this.createElement('li', ['titleItem']);
            const titleEl = this.createElement('div', ['itemTitle']);
            titleEl.textContent = item.title;
            noteTitle.appendChild(titleEl);
            const dateEl = this.createElement('small', ['itemDate']);
            dateEl.textContent = OSDate.formatDate(item.updateDate || item.createDate, this.device.timeZone, true);
            noteTitle.appendChild(dateEl);
            this.addEventListener('click', () => {
                this.history.pushState('/notes/detail', item.id);
            }, noteTitle)
            noteList.appendChild(noteTitle);
        }
        scrollArea.appendChild(noteList);
        this.mainArea.appendChild(scrollArea);
    }

    update(_: string, data: Note[]) {
        this.mainArea.innerHTML = ''
        this.removeAllEventListeners()
        this.render(data)
    }

    private sortByDate(notes: Note[]): Note[] {
        return notes.sort((a, b) => {
            const dateA = a.updateDate || a.createDate;
            const dateB = b.updateDate || b.createDate;
            return dateB.getTime() - dateA.getTime();
        })
    }
}
