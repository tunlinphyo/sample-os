import { App } from "../../../components/app";
import { CalendarRenderer } from "../../../components/calendar";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { JournalController } from "../journal.controller";


export class JournalApp extends App {
    private calendarRenderer: CalendarRenderer;

    constructor(
        history: HistoryStateManager,
        private journal: JournalController,
        private device: DeviceController
    ) {
        super(history, { template: 'calendarTemplate', btnStart: 'today', btnEnd: 'edit' });

        this.onCallback = this.onCallback.bind(this);
        this.calendarRenderer = new CalendarRenderer(this.device, this.mainArea, this.onCallback);
        this.mainArea = this.getElement('#journalDays');
        this.init();
    }

    private init() {
        this.addEventListener('click', () => {
            this.history.replaceState('/', new Date());
            this.render(new Date());
        }, this.btnStart, false);

        this.addEventListener('click', () => {
            const journal = this.journal.getTodayJournal();
            this.history.pushState('/journal/edit', journal);
        }, this.btnEnd, false);

        this.calendarRenderer.listen<Date>('onDateClick', (date) => {
            if (!date) return;
            const journal = this.journal.getJournalByDate(date);
            if (journal) {
                this.history.pushState('/journal/detail', date);
            }
        });

        this.calendarRenderer.listen<Date>('viewDateChange', (date) => {
            if (!date) return;
            this.history.replaceState('/', date);
            this.render(date);
        });

        this.journal.addChangeListener((status: string) => {
            if (status === 'JOURNAL_CHANGE') {
                this.update("update", this.journal.current);
            }
        });
    }

    async onCallback(date: Date): Promise<Date[]> {
        return this.journal.getActiveDates(date);
    }

    render(data?: Date) {
        if (!data) data = new Date();
        this.journal.current = data;
        this.calendarRenderer.data = data;
    }

    update(_: string, data: Date) {
        this.render(data)
    }
}
