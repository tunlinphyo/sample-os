import '../../style.css';
import './journal.css';

import { HistoryStateManager } from "../../device/history.manager";
import { JournalStore } from '../../stores/journal.store';
import { JournalController } from './journal.controller';
import { JournalApp } from './pages/app.page';
import { JournalAppController } from './app.controller';
import { JournalPage } from './pages/journal.page';
import { JournalEditorPage } from './pages/journal.editor';

document.body.dataset.schema = parent.device.theme;

document.addEventListener('DOMContentLoaded', () => {
    const historyManager = new HistoryStateManager();
    const journalStore = new JournalStore();
    const journalController = new JournalController(journalStore);

    const app = new JournalApp(historyManager, journalController, parent.device);
    const journalPage = new JournalPage(historyManager, journalController, parent.device);
    const journalEditor = new JournalEditorPage(historyManager, journalController, parent.device);

    new JournalAppController(
        historyManager,
        parent.device,
        journalController,
        app,
        journalPage,
        journalEditor
    );
});