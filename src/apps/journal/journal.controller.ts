import { BaseController } from "../../controllers/base.controller";
import { Journal, JournalStore } from "../../stores/journal.store";


export class JournalController extends BaseController {
    public today: Date = new Date();
    private _current: Date = new Date();

    constructor(private store: JournalStore) {
        super();
        this.setupListeners();
        this.today.setHours(0 ,0, 0, 0);
    }

    get current() {
        return this._current;
    }
    set current(date: Date) {
        this._current = date;
    }

    private setupListeners() {
        this.store.listen((list) => {
            this.notifyListeners('JOURNAL_CHANGE', list);
        });
    }

    public getActiveDates(date: Date) {
        return this.store.getActiveDates(date);
    }

    public getTodayJournal() {
        return this.store.getJournal(this.today);
    }

    public getJournalByDate(date: Date) {
        date.setHours(0 ,0, 0, 0);

        if (date <= this.today) {
            const journal = this.store.getJournal(date);
            if (journal.id) return journal;
        }
        return null;
    }

    public getJournalById(id: string) {
        return this.store.get(id);
    }

    public saveJournal(note: Journal) {
        this.tryThis(async () => {
            if (note.id) await this.store.update(note.id, note);
            else await this.store.add(note);
            this.notifyListeners('JOURNAL_SAVED', note.id);
        });
    }

    public deleteJournal(id: string) {
        this.tryThis(async () => {
            await this.store.del(id);
            this.notifyListeners('JOURNAL_DELETED', id);
        });
    }
}