import { DeviceController } from "../../device/device";
import { HistoryState, HistoryStateManager } from "../../device/history.manager";
import { OSDate } from "../../utils/date";
import { JournalController } from "./journal.controller";
import { JournalApp } from "./pages/app.page";
import { JournalEditorPage } from "./pages/journal.editor";
import { JournalPage } from "./pages/journal.page";

export class JournalAppController {
    constructor(
        private history: HistoryStateManager,
        private device: DeviceController,
        private journal: JournalController,
        private app: JournalApp,
        private journalPage: JournalPage,
        private journalEditor: JournalEditorPage
    ) {
        this.renderListeners();
    }

    private renderListeners() {
        const handleChange = (state: any, url: string) => {
            this.history.handleChange(url, [
                {
                    pattern: '/',
                    callback: () => {
                        this.app.render(state);
                    }
                }, {
                    pattern: '/journal/detail',
                    callback: () => {
                        const journal = this.journal.getJournalByDate(state);
                        if (journal) {
                            this.journalPage.openPage(OSDate.formatDate(state, this.device.timeZone, true, true), journal);
                        }
                    }
                }, {
                    pattern: '/journal/edit',
                    callback: () => {
                        if (state) {
                            this.journalEditor.openPage(OSDate.formatDate(state.createDate, this.device.timeZone, true, true), state);
                        }
                    }
                },
            ]);
        }

        this.history.onStateChange(handleChange);

        this.device.addEventListener('openAppFinished', () => {
            let history = parent.device.getHistory('journal');
            if (!history) {
                history = [{ url: '/', state: this.journal.today }];
            }
            // console.log('OPEN_PAGE', history);
            this.history.init(history);
            history.forEach((item: HistoryState) => {
                handleChange(item.state, item.url);
            })
        })

        this.device.addEventListener('closeApp', () => {
            // console.log('CLOSE_PAGE', JSON.stringify(this.history.history));
            this.device.setHistory('journal', this.history.history);
        });
    }
}