import { BaseController } from '../../controllers/base.controller';
import { Note, NotesStore } from '../../stores/notes.store';


export class NotesController extends BaseController {
    constructor(
        private store: NotesStore,
    ) {
        super();
        this.setupListeners();
    }

    private setupListeners() {
        this.store.listen((notes) => {
            this.notifyListeners('NOTES_CHANGED', notes);
        });
    }

    public getNote(id: string) {
        return this.store.get(id);
    }

    public saveNote(note: Note) {
        this.tryThis(async () => {
            if (note.id) await this.store.update(note.id, note);
            else await this.store.add(note);
            this.notifyListeners('NOTE_SAVED', note.id);
        });
    }

    public deleteNote(id: string) {
        this.tryThis(async() => {
            await this.store.del(id);
            this.notifyListeners('NOTE_DELETED', id);
        });
    }
}