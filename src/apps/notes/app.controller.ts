import { DeviceController } from "../../device/device";
import { HistoryState, HistoryStateManager } from "../../device/history.manager";
import { NotesController } from "./notes.controller";
import { NoteEditorPage } from "./pages/note.editor";
import { NotePage } from "./pages/note.page";


export class NoteAppController {
    constructor(
        private history: HistoryStateManager,
        private device: DeviceController,
        private notes: NotesController,
        private notePage: NotePage,
        private noteEditor: NoteEditorPage
    ) {
        this.renderListeners();
    }

    private renderListeners() {
        const handleChange = (state: any, url: string) => {
            this.history.handleChange(url, [
                {
                    pattern: '/notes/detail',
                    callback: () => {
                        const note = this.notes.getNote(state);
                        this.notePage.openPage('Note', note);
                    }
                }, {
                    pattern: '/notes/new',
                    callback: () => {
                        this.noteEditor.openPage('New Note', state);
                    }
                },  {
                    pattern: '/notes/edit',
                    callback: () => {
                        this.noteEditor.openPage('Edit Note', state);
                    }
                }
            ]);
        }

        this.history.onStateChange(handleChange);

        this.device.addEventListener('openAppFinished', () => {
            const history = parent.device.getHistory('notes');
            if (!history) return;
            // console.log('OPEN_PAGE', history);
            this.history.init(history);
            history.forEach((item: HistoryState) => {
                handleChange(item.state, item.url);
            })
        })

        this.device.addEventListener('closeApp', () => {
            // console.log('CLOSE_PAGE', JSON.stringify(this.history.history));
            this.device.setHistory('notes', this.history.history);
        });
    }
}