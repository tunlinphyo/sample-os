import { EnTextKeyboard } from "../../../components/keyboard";
import { anotherNoteSentences, noteSentences, noteTitles } from "../../../components/keyboard/consts";
import { Modal } from "../../../components/modal";
import { SelectItem } from "../../../components/select";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Note, NoteData, NoteType } from "../../../stores/notes.store";
import { NotesController } from "../notes.controller";


export class NoteEditorPage extends Modal {
    private keyboard: EnTextKeyboard;
    private note: Note | undefined;
    private keysArea: HTMLElement;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private notes: NotesController
    ) {
        super(history, { template: 'editorTemplate', btnStart: 'match_case', btnEnd: 'check' });

        this.mainArea = this.getElement('.keyboardTextArea');
        this.keysArea = this.getElement('.keyboardKeysArea');
        this.keyboard = new EnTextKeyboard(this.keysArea);

        this.init();
    }

    private init() {
        this.listen('pageOpenFinished', () => {
            this.focusLastElem();
        });

        this.addEventListener('click', () => {
            this.changeType()
        }, this.btnStart, false);

        this.addEventListener('click', () => {
            const data = this.getData();
            if (!data) return;
            this.notes.saveNote(data);
        }, this.btnEnd, false);

        this.notes.addChangeListener((status: string) => {
            if (status === "NOTE_SAVED") {
                this.closePage();
            }
        });

        this.device.addEventListener('closeApp', () => {
            const data = this.getData();
            if (data) {
                if (data.id) this.history.updateState(`/notes/edit`, data);
                else this.history.updateState(`/notes/new`, data);
            }
        });
    }

    render(data?: Note) {
        if (data) this.note = data;
        else {
            this.note = {
                id: '',
                title: '',
                body: [
                    { type: 'title', data: [] }
                ],
                createDate: new Date(),
                deleted: false,
            }
        }
        this.renderInitData();
        this.keyEventListeners();
    }

    update() {}

    private renderInitData() {
        for (const note of this.note!.body) {
            this.renderElement(note);
        }
    }

    private getData() {
        const list: NoteData[] = [];
        const elems = this.getAllElement('.section');

        for (const elem of elems) {
            const type = elem.dataset.type as NoteType;
            list.push(this.getContent(elem, type));
        }
        const title = list.find(item => item.type === 'title')

        if (!(title && title.data.length)) return null;

        this.note!.title = title.data[0] || '';
        this.note!.body = list;
        this.note

        return this.note;
    }

    private getContent(elem: HTMLElement, type: NoteType) {
        let data: string[] = this.getItemListDataArray(elem);
        return { type, data };
    }

    private async changeType() {
        const list: SelectItem[] = [
            {
                title: 'Title',
                value: 'title',
                icon: 'title',
            },
            {
                title: 'Paragraph',
                value: 'paragraph',
                icon: 'format_paragraph',
            },
            {
                title: 'Ordered List',
                value: 'order-list',
                icon: 'format_list_numbered',
            },
            {
                title: 'Unordered List',
                value: 'unorder-list',
                icon: 'format_list_bulleted',
            },
            {
                title: 'Quote',
                value: 'quote',
                icon: 'format_quote',
            }
        ]
        const selected = await this.device.selectList.openPage('Format', list);
        if (selected) {
            this.handleTypeChange(selected);
        }
    }

    private keyEventListeners() {
        this.keyboard.onKey(text => {
            if (!text) return;
            switch (text) {
                case 'ENTER':
                    this.handleEnter();
                    break;
                case 'DELETE':
                    this.handleDelete();
                    break;
                default:
                    this.handleKeyText(text);
                    break;
            }
        });
    }

    private handleTypeChange(toType: string) {
        const foucsed = this.getEl('.focus');
        if (!foucsed) return;
        const parentEl = foucsed.parentElement;
        if(!parentEl) return;

        const type = parentEl.dataset.type as string;
        if (type === toType) return;
        parentEl.dataset.type = toType;
    }

    private handleKeyText(key: string) {
        const focused = this.getEl('.focus');
        if (!focused) return;
        const parentEl = focused.parentElement;
        if (!parentEl) return;
        const type = parentEl.dataset.type as string;

        if (type === 'title') {
            if (noteTitles[key]) focused.textContent = noteTitles[key];
        } else if (this.isParagraph(type)) {
            const insertData = noteSentences[key] || anotherNoteSentences[key];
            if (insertData) {
                this.insertTextItem(focused, insertData)
            }
        } else {
            const insertData = noteSentences[key] || anotherNoteSentences[key];
            if (insertData) {
                this.insertListItem(focused, insertData);
            }
        }
    }

    private handleEnter() {
        const foucsed = this.getEl('.focus');
        if (!foucsed) return;
        const parentEl = foucsed.parentElement;
        if (!parentEl) return;

        const type = parentEl.dataset.type as NoteType;
        if (this.isParagraph(type)) {
            const nextDatas = this.getNextSiblingsData(foucsed);
            const data = nextDatas.length ? ['', ...nextDatas] : [''];
            this.createSection(parentEl, { type: 'paragraph', data });
        } else {
            this.createListItem(parentEl, foucsed);
        }
    }

    private handleDelete() {
        const focused = this.getEl('.focus');
        if (!focused) return;

        const parentEl = focused.parentElement;
        if (!parentEl) return;
        const type = parentEl.dataset.type as NoteType;

        this.removeItem(parentEl, focused, type);
    }

    private renderElement(note: NoteData) {
        // @ts-ignore
        if (note.type === 'check-list') return;

        this.renderSection(note);
    }

    private renderSection(note: NoteData, prevEl?: HTMLElement) {
        const newSection = this.createElement('div', ['section'], { 'data-type': note.type });
        const list = note.data.length ? note.data : [''];
        for (const text of list) {
            this.renderItem(newSection, text)
        }
        if (prevEl) {
            prevEl.insertAdjacentElement('afterend', newSection);
        } else {
            this.mainArea.appendChild(newSection);
        }

        this.addFocusListenerParent(newSection);
    }

    private renderItem(parentEl: HTMLElement, text: string = '') {
        const itemEl = this.createElement('div', ['item']);
        itemEl.textContent = text;
        this.addFocusListener(itemEl);
        parentEl.appendChild(itemEl);
    }

    private createSection(prevEl?: HTMLElement, note?: NoteData) {
        const newSection = this.createElement('div', ['section'], { 'data-type': note?.type || 'paragraph' });
        const list = note?.data.length ? note.data : [''];
        let currentEl: HTMLElement | null = null;
        for (const text of list) {
            currentEl = this.createItem(newSection, currentEl, text)
        }
        if (newSection.firstElementChild)
            this.focusElement(newSection.firstElementChild as HTMLElement);
        if (prevEl) {
            prevEl.insertAdjacentElement('afterend', newSection);
        } else {
            this.mainArea.appendChild(newSection);
        }

        this.addFocusListenerParent(newSection);
        return newSection;
    }

    private createItem(parentEl: HTMLElement, elem: HTMLElement | null, text: string = '') {
        const focused = this.getEl('.focus');
        if (focused) {
            focused.classList.remove('focus');
        }
        const itemEl = this.createElement('div', ['item']);
        itemEl.textContent = text;
        this.addFocusListener(itemEl);
        if (elem) {
            elem.insertAdjacentElement('afterend', itemEl);
        } else {
            parentEl.appendChild(itemEl);
        }

        return itemEl;
    }

    private createListItem(parentEl: HTMLElement, elem: HTMLElement) {
        if (elem.textContent) {
            const currentEl = this.createItem(parentEl, elem, '');
            this.focusElement(currentEl);
        } else {
            const nextDatas = this.getNextSiblingsData(elem);
            const currentEl = this.createSection(parentEl);
            if (nextDatas.length) {
                const type = parentEl.dataset.type as NoteType;
                this.renderSection({ type, data: nextDatas }, currentEl);
            }
            elem.remove();
        }
    }

    private insertTextItem(elem: HTMLElement, text: string) {
        if (!elem.textContent)  {
            elem.textContent = text;
            return this.focusElement(elem);
        }

        elem.classList.remove('focus');
        const itemEl = this.createElement('div', ['item', 'focus']);
        itemEl.textContent = text;
        elem.insertAdjacentElement('afterend', itemEl);
        this.addFocusListener(itemEl);
        this.focusElement(itemEl);
    }

    private insertListItem(elem: HTMLElement, text: string) {
        elem.textContent = text;
        this.focusElement(elem);
    }

    private removeItem(parent: HTMLElement, item: HTMLElement, type: NoteType) {
        if (this.isParagraph(type)) {
            this.removeTextItem(parent, item);
        } else {
            this.removeListItem(parent, item);
        }
    }

    private removeTextItem(parent: HTMLElement, item: HTMLElement) {
        const previousSibling = item.previousElementSibling as HTMLElement;
        if (previousSibling) {
            item.remove();
            this.focusElement(previousSibling);
        } else if (!previousSibling) {
            if (item.textContent) {
                item.textContent = '';
            } else {
                const parentPrevSibling = parent.previousElementSibling as HTMLElement;
                if (parentPrevSibling) {
                    if (parent.children.length == 1) {
                        parent.remove();
                    } else {
                        item.remove();
                    }
                    if (parentPrevSibling.lastChild)
                        this.focusElement(parentPrevSibling.lastChild as HTMLElement);
                } else {
                    item.textContent = '';
                }
            }
        } else {
            item.textContent = '';
        }
    }

    private removeListItem(parent: HTMLElement, item: HTMLElement) {
        const content = item.textContent;
        if (content) {
            item.textContent = '';
        } else {
            this.removeTextItem(parent, item);
        }
    }

    private focusLastElem() {
        const laseEl = this.mainArea.lastChild as HTMLElement;
        if (!laseEl) return;
        const laseItemEl = laseEl.lastChild as HTMLElement;
        this.focusElement(laseItemEl);
    }

    private addFocusListenerParent(elem: HTMLElement) {
        this.addEventListener('click', (event) => {
            const targetEl = event.target as HTMLElement;
            if (targetEl == elem) {
                const focused = this.getEl('.focus');
                if (focused) {
                    focused.classList.remove('focus');
                }
                this.focusElement(targetEl.lastElementChild as HTMLElement);
            }
        }, elem);
    }

    private addFocusListener(elem: HTMLElement) {
        this.addEventListener('click', () => {
            const focused = this.getEl('.focus');
            if (focused) {
                focused.classList.remove('focus');
            }
            this.focusElement(elem);
        }, elem);
    }

    private focusElement(elem: HTMLElement) {
        setTimeout(() => {
            elem.classList.add('focus');
            elem.scrollIntoView({
                behavior: 'auto',
                block: 'center',
                inline: 'nearest'
            });
        }, 0);
    }

    private getEl<T extends HTMLElement>(selector: string, parent: HTMLElement = this.mainArea) {
        const elem = parent.querySelector(selector)

        if (!elem) return null;
        return elem as T;
    }

    private getNextSiblingsData(element: HTMLElement) {
        const siblings: string[] = [];
        let nextSibling = element.nextElementSibling;
        while (nextSibling) {
          siblings.push(nextSibling.textContent || '');
          const next = nextSibling;
          nextSibling = next.nextElementSibling;
          next.remove();
        }
        return siblings;
    }

    private getItemListDataArray(elem: HTMLElement) {
        let list: string[] = [];
        Array.from(elem.children).forEach(elem => {
            if (elem.textContent) list.push(elem.textContent);
        })
        return list;
    }

    private isParagraph(type: string) {
        return (
            type === 'paragraph'
            || type === 'title'
            || type === 'quote'
        )
    }
}
