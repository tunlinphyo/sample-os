import '../../style.css';
import './notes.css';

import { HistoryStateManager } from '../../device/history.manager';
import { NotesStore } from '../../stores/notes.store';
import { NotesApp } from './pages/app.page';
import { NotesController } from './notes.controller';
import { NotePage } from './pages/note.page';
import { NoteEditorPage } from './pages/note.editor';
import { NoteAppController } from './app.controller';
import { AudioRecoder } from './pages/audio.recoder';

document.body.dataset.schema = parent.device.theme;

document.addEventListener('DOMContentLoaded', () => {
    const historyManager = new HistoryStateManager();
    const noteStore = new NotesStore();
    const notesController = new NotesController(noteStore);

    new NotesApp(historyManager, parent.device, notesController);
    const notePage = new NotePage(historyManager, parent.device, notesController);
    const noteEditor = new NoteEditorPage(historyManager, parent.device, notesController);
    const audioRecoder = new AudioRecoder(historyManager, parent.device, parent.setting, notesController);

    new NoteAppController(
        historyManager,
        parent.device,
        notesController,
        notePage,
        noteEditor,
        audioRecoder
    );
});