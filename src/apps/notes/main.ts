import { HistoryStateManager } from '../../device/history.manager';
import { NotesStore } from '../../stores/notes.store';
import '../../style.css';
import './notes.css';
import { NotesApp } from './pages/app.page';
import { NotesController } from './notes.controller';
import { NotePage } from './pages/note.page';
import { NoteEditorPage } from './pages/note.editor';
import { NoteAppController } from './app.controller';

document.body.dataset.schema = parent.device.theme;

document.addEventListener('DOMContentLoaded', () => {
    const historyManager = new HistoryStateManager();
    const noteStore = new NotesStore();
    const notesController = new NotesController(noteStore);

    new NotesApp(historyManager, parent.device, notesController);
    const notePage = new NotePage(historyManager, parent.device, notesController);
    const noteEditor = new NoteEditorPage(historyManager, parent.device, notesController);

    new NoteAppController(
        historyManager,
        parent.device,
        notesController,
        notePage,
        noteEditor
    );
});