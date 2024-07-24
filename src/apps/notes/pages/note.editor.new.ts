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
    private note?: Note;
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
        this.listen('pageOpenFinished', () => this.focusLastElem());

        this.addEventListener('click', this.changeType.bind(this), this.btnStart, false);
        this.addEventListener('click', this.saveNote.bind(this), this.btnEnd, false);

        this.notes.addChangeListener(this.handleNoteSaved.bind(this));

        this.device.addEventListener('closeApp', this.handleCloseApp.bind(this));
    }

    render(data?: Note) {
        this.note = data ?? this.createEmptyNote();
        this.renderInitData();
        this.keyEventListeners();
    }

    update() { }

    private createEmptyNote(): Note {
        return {
            id: '',
            title: '',
            body: [{ type: 'title', data: [] }],
            createDate: new Date(),
            deleted: false,
        };
    }

    private renderInitData() {
        this.note!.body.forEach(note => this.renderElement(note));
    }

    private getData(): Note | null {
        const list: NoteData[] = Array.from(this.getAllElement('.section')).map(elem => {
            const type = elem.dataset.type as NoteType;
            return this.getContent(elem, type);
        });

        const title = list.find(item => item.type === 'title');

        if (!(title && title.data.length)) return null;

        this.note!.title = title.data[0] || '';
        this.note!.body = list;
        return this.note!;
    }

    private getContent(elem: HTMLElement, type: NoteType): NoteData {
        const data = this.getItemListDataArray(elem);
        return { type, data };
    }

    private async changeType() {
        const list: SelectItem[] = [
            { title: 'Title', value: 'title', icon: 'title' },
            { title: 'Paragraph', value: 'paragraph', icon: 'format_paragraph' },
            { title: 'Ordered List', value: 'order-list', icon: 'format_list_numbered' },
            { title: 'Unordered List', value: 'unorder-list', icon: 'format_list_bulleted' },
            { title: 'Quote', value: 'quote', icon: 'format_quote' }
        ];
        const selected = await this.device.selectList.openPage<string>('Format', list);
        if (selected && typeof selected === 'string') {
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
        const focused = this.getEl('.focus');
        if (!focused) return;
        const parentEl = focused.parentElement;
        if (!parentEl) return;

        const type = parentEl.dataset.type as string;
        if (type !== toType) {
            parentEl.dataset.type = toType;
        }
    }

    private handleKeyText(key: string) {
        const focused = this.getEl('.focus');
        if (!focused) return;
        const parentEl = focused.parentElement;
        if (!parentEl) return;
        const type = parentEl.dataset.type as string;

        const insertData = noteSentences[key] || anotherNoteSentences[key];
        if (insertData) {
            if (type === 'title') {
                focused.textContent = noteTitles[key] || insertData;
            } else {
                this.insertTextItem(focused, insertData);
            }
        }
    }

    private handleEnter() {
        const focused = this.getEl('.focus');
        if (!focused) return;
        const parentEl = focused.parentElement;
        if (!parentEl) return;

        const type = parentEl.dataset.type as NoteType;
        if (this.isParagraph(type)) {
            const nextDatas = this.getNextSiblingsData(focused);
            const data = nextDatas.length ? ['', ...nextDatas] : [''];
            this.createSection(parentEl, { type: 'paragraph', data });
        } else {
            this.createListItem(parentEl, focused);
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
        if (note.type !== 'check-list') {
            this.renderSection(note);
        }
    }

    private renderSection(note: NoteData, prevEl?: HTMLElement) {
        const newSection = this.createElement('div', ['section'], { 'data-type': note.type });
        note.data.forEach(text => this.renderItem(newSection, text));
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
        note?.data.forEach(text => this.createItem(newSection, null, text));
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
        if (focused) focused.classList.remove('focus');

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
        if (!elem.textContent) {
            elem.textContent = text;
            this.focusElement(elem);
            return;
        }

        elem.classList.remove('focus');
        const itemEl = this.createElement('div', ['item', 'focus']);
        itemEl.textContent = text;
        elem.insertAdjacentElement('afterend', itemEl);
        this.addFocusListener(itemEl);
        this.focusElement(itemEl);
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
        } else {
            const parentPrevSibling = parent.previousElementSibling as HTMLElement;
            if (parentPrevSibling) {
                if (parent.children.length === 1) {
                    parent.remove();
                } else {
                    item.remove();
                }
                if (parentPrevSibling.lastChild) {
                    this.focusElement(parentPrevSibling.lastChild as HTMLElement);
                    this.moveChildElements(parent, parentPrevSibling);
                } else {
                    this.insertTextToEmpty(parentPrevSibling);
                    this.moveChildElements(parent, parentPrevSibling);
                }
                parent.remove();
            } else {
                item.textContent = '';
            }
        }
    }
    private moveChildElements(source: HTMLElement, destination: HTMLElement) {
        Array.from(source.children).forEach(child => {
            const clone = child.cloneNode(true);
            destination.appendChild(clone);
            child.remove();
        });
    }

    private removeListItem(parent: HTMLElement, item: HTMLElement) {
        if (item.textContent) {
            item.textContent = '';
        } else {
            this.removeTextItem(parent, item);
        }
    }

    private focusLastElem() {
        const lastEl = this.mainArea.lastChild as HTMLElement;
        if (lastEl && lastEl.lastChild) {
            this.focusElement(lastEl.lastChild as HTMLElement);
        }
    }

    private addFocusListenerParent(elem: HTMLElement) {
        this.addEventListener('click', (event) => {
            const targetEl = event.target as HTMLElement;
            if (targetEl === elem) {
                const focused = this.getEl('.focus');
                if (focused) focused.classList.remove('focus');
                this.focusElement(targetEl.lastElementChild as HTMLElement);
            }
        }, elem);
    }

    private checkPosition(event: MouseEvent): "FRONT" | "BACK" | "NULL" {
        const span = event.target as HTMLSpanElement;
        const offset = this.getOffsetFromEvent(span, event);

        if (offset !== null) {
            const textLength = span.textContent!.length;
            const halfLength = textLength / 2;
            return offset < halfLength ? "FRONT" : "BACK";
        } else {
            return "NULL";
        }
    }

    private getOffsetFromEvent(element: HTMLElement, event: MouseEvent) {
        const range = document.createRange();
        const nodes = element.childNodes!;
        let totalOffset = 0;

        for (const node of nodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                for (let j = 0; j < node.textContent!.length; j++) {
                    range.setStart(node, j);
                    range.setEnd(node, j + 1);

                    const rect = range.getBoundingClientRect();
                    if (rect.left <= event.clientX && event.clientX <= rect.right &&
                        rect.top <= event.clientY && event.clientY <= rect.bottom) {
                        return totalOffset + j;
                    }
                }
                totalOffset += node.textContent!.length;
            }
        }
        return null;
    }

    private addFocusListener(elem: HTMLElement) {
        this.addEventListener('click', (event) => {
            const focused = this.getEl('.focus');
            if (focused) focused.classList.remove('focus');

            const position = this.checkPosition(event as MouseEvent);
            if (position === 'FRONT') {
                const prevEl = elem.previousElementSibling;
                if (prevEl) {
                    this.focusElement(prevEl as HTMLElement);
                } else {
                    if (this.isParagraph(elem.parentElement!.dataset.type as string)) {
                        this.insertTextItemBefore(elem);
                    } else {
                        this.focusElement(elem);
                    }
                }
            } else {
                this.focusElement(elem);
            }
        }, elem);
    }

    private insertTextItemBefore(elem: HTMLElement) {
        const itemEl = this.createElement('div', ['item', 'focus']);
        itemEl.textContent = "";
        elem.insertAdjacentElement('beforebegin', itemEl);
        this.addFocusListener(itemEl);
        this.focusElement(itemEl);
    }

    private insertTextToEmpty(parentEl: HTMLElement) {
        const itemEl = this.createElement('div', ['item', 'focus']);
        itemEl.textContent = "";
        parentEl.insertAdjacentElement('beforeend', itemEl);
        this.addFocusListener(itemEl);
        this.focusElement(itemEl);
    }

    private focusElement(elem: HTMLElement) {
        setTimeout(() => {
            elem.classList.add('focus');
            elem.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'nearest' });
        }, 0);
    }

    private getEl<T extends HTMLElement>(selector: string, parent: HTMLElement = this.mainArea): T | null {
        return parent.querySelector(selector) as T | null;
    }

    private getNextSiblingsData(element: HTMLElement): string[] {
        const siblings: string[] = [];
        let nextSibling = element.nextElementSibling;
        while (nextSibling) {
            siblings.push(nextSibling.textContent || '');
            nextSibling.remove();
            nextSibling = nextSibling.nextElementSibling;
        }
        return siblings;
    }

    private getItemListDataArray(elem: HTMLElement): string[] {
        return Array.from(elem.children).map(child => child.textContent || '');
    }

    private isParagraph(type: string): boolean {
        return ['paragraph', 'title', 'quote'].includes(type);
    }

    private saveNote() {
        const data = this.getData();
        if (data) this.notes.saveNote(data);
    }

    private handleNoteSaved(status: string) {
        if (status === "NOTE_SAVED") {
            this.closePage();
        }
    }

    private handleCloseApp() {
        const data = this.getData();
        if (data) {
            const path = data.id ? `/notes/edit` : `/notes/new`;
            this.history.updateState(path, data);
        }
    }
}