import { BaseComponent } from "../base";
import { EnNumberKeyboard } from "./en.number.keyboard";
import { EnTextKeyboard } from "./en.text.keyboard";

export { EnTextKeyboard } from "./en.text.keyboard";

type KeyboardType = 'text' | 'textarea' | 'number' | 'email' | 'phone';

export type KeyboardPrefixTexts = { [key: string]: string }

export interface Keyboard {
    label: string;
    defaultValue: string;
    type: KeyboardType;
    btnStart?: string;
    btnEnd?: string;
    keys?: KeyboardPrefixTexts;
}

export class KeyboardPage extends BaseComponent {
    private keyboard: EnTextKeyboard | EnNumberKeyboard | undefined;

    private parentEl: HTMLElement;
    private textArea: HTMLElement;
    private keysArea: HTMLElement;
    private textList: string[] = [];

    public btnStart?: HTMLButtonElement | undefined;
    public btnCenter?: HTMLButtonElement | undefined;
    public btnEnd?: HTMLButtonElement | undefined;

    public isActive: boolean = false;

    private toSplit: boolean = false;

    constructor() {
        super('keyboardTemplate');
        this.parentEl = this.getElement('#device', document.body);

        this.component.classList.add('screen--modal');
        this.textArea = this.getElement('.keyboardTextArea .textArea');
        this.keysArea = this.getElement('.keyboardKeysArea');

        this.setupActionButton('close', 'center');
        this.close = this.close.bind(this);
        this.init();
    }

    get text(): string {
        return this.toSplit ? this.textList.join(' ') : this.textList.join('');
    }
    set text(data: string) {
        this.textList.push(data);
    }
    set textData(data: string) {
        this.textList = [data];
    }

    private init() {
        this.addEventListener('click', this.close, this.btnCenter, false);
    }

    public listen<Contact>(eventName: string, callback: (data?: Contact) => void): void {
        this.addEventListener(eventName, (event) => {
            // @ts-ignore
            const data: Contact = event.detail.data;
            callback(data);
        }, this.component, false);
    }

    public open(data: Keyboard): Promise<string> {
        this.toSplit = (data.type === 'textarea' || !!data.keys) && data.type !== 'number';
        this.parentEl.appendChild(this.component);
        this.initializeTextList(data);

        return new Promise(resolve => {
            this.setupTextArea();

            this.setupButtons(data, resolve);

            this.getElement('.statusBar-title').innerHTML = data.label;

            this.renderKeyboard(data).then(resolve);

            setTimeout(() => {
                this.showComponent();
                this.setupTransitionEndHandler(resolve);
            }, 0);
        });
    }

    private initializeTextList(data: Keyboard) {
        if (data.type === 'textarea') {
            this.textList = this.splitParagraphsToSentences(data.defaultValue);
        } else if (data.type === 'number' && !data.keys) {
            this.textList = data.defaultValue.split('');
        } else {
            this.textData = data.defaultValue;
        }
    }

    private setupTextArea() {
        this.textArea.textContent = this.text;
    }

    private setupButtons(data: Keyboard, resolve: (value: string | PromiseLike<string>) => void) {
        if (data.btnStart) {
            this.setupActionButton(data.btnStart, 'start')?.then(() => {
                resolve('START_CLICK');
            });
        } else {
            this.removeButton('start');
        }

        if (data.btnEnd) {
            this.setupActionButton(data.btnEnd, 'end')?.then(resolve);
        } else {
            this.removeButton('end');
        }
    }

    private showComponent() {
        this.component.classList.add('screen--show');
        this.dispatchCustomEvent('keyboardOpen');
    }

    private setupTransitionEndHandler(_: (value: string | PromiseLike<string>) => void) {
        // console.log(resolve);
        const transitionEndHandler = () => {
            this.dispatchCustomEvent('keyboardOpenFinished');
            this.isActive = true;
            this.component.removeEventListener('transitionend', transitionEndHandler);
        };
        this.component.addEventListener('transitionend', transitionEndHandler);
    }

    public close() {
        this.component.classList.remove('screen--show');
        this.dispatchCustomEvent('keyboardClose');

        const transitionEndHandler = () => {
            this.component.removeEventListener('transitionend', transitionEndHandler);
            this.dispatchCustomEvent('keyboardCloseFinished');
            this.isActive = false;
            this.removeAllEventListeners();
            if (!this.component.classList.contains('screen--show')) {
                this.component.remove();
            }
        };
        this.component.addEventListener('transitionend', transitionEndHandler);
    }

    private renderKeyboard(data: Keyboard) {
        if (data.type === 'number') return this.renderNumberKeyboard(data);
        return this.renderTextKeyboard(data);
    }

    private renderTextKeyboard(data: Keyboard): Promise<string> {
        return new Promise(resolve => {
            this.keyboard = new EnTextKeyboard(this.keysArea);

            this.keyboard.onKey(this.handleKeyPress.bind(this, data, resolve));
        });
    }

    private renderNumberKeyboard(data: Keyboard): Promise<string> {
        return new Promise(() => {
            this.keyboard = new EnNumberKeyboard(this.keysArea);

            this.keyboard.onKey(this.handleNumKeyPress.bind(this, data, () => {}));
        });
    }

    private handleKeyPress(data: Keyboard, resolve: (value: string) => void, key: string) {
        if (!key) return;
        if (key === 'ENTER') {
            resolve(this.text);
            this.close();
        } else if (key === 'DELETE') {
            this.textList = this.textList.slice(0, -1);
        } else {
            const newText = data.keys ? (data.keys[key] || data.keys[key.toLowerCase()]) : key;
            if (newText) {
                if (data.type === 'textarea' || !data.keys) this.text = newText;
                else this.textData = newText;
            }
        }
        this.textArea.innerHTML = this.text;
    }

    private handleNumKeyPress(data: Keyboard, _: (value: string) => void, key: string) {
        // console.log(resolve);
        if (!key) return;
        if (key === 'DELETE') {
            this.textList = this.textList.slice(0, -1);
        } else {
            if (data.keys) {
                if (this.text.length === 1) {
                    const index = this.text.concat(key);
                    this.textData = data.keys[index];
                } else if (this.text.length > 2) {
                    this.textData = key;
                } else {
                    this.text = key;
                }
            } else {
                this.text = key;
            }
        }
        this.textArea.innerHTML = this.text;
    }

    private setupActionButton(icon: string | undefined, position: 'start' | 'end' | 'center'): Promise<string> | void {
        if (icon) {
            const button = this.createElement<HTMLButtonElement>('button', ['actionButton', position], { type: 'button' });
            button.innerHTML = `<span class="material-symbols-outlined icon">${icon}</span>`;
            const target = this.getElement(`.actionButton.${position}`);
            this.replaceElement(target, button);

            if (position === 'start') this.btnStart = button;
            if (position === 'center') this.btnCenter = button;
            if (position === 'end') this.btnEnd = button;
            if (position === 'end' && (icon === 'check' || icon === 'send')) {
                return new Promise(resolve => {
                    this.addEventListener('click', () => {
                        resolve(this.text);
                        this.close();
                    }, button, false);
                });
            }
        }
    }

    private splitParagraphsToSentences(text: string): string[] {
        const sentenceRegex = /[^.!?]*[.!?]/g;
        let sentences: string[] = [];

        const matches = text.match(sentenceRegex);
        if (matches) {
            sentences = sentences.concat(matches.map(sentence => sentence.trim()));
        }

        return sentences;
    }

    private removeButton(position: 'start' | 'end' | 'center') {
        try {
            const target = this.getElement(`.actionButton.${position}`);
            const elem = this.createElement('div', ['actionButton', position]);
            this.replaceElement(target, elem);

            if (position === 'start') this.btnStart = undefined;
            if (position === 'center') this.btnCenter = undefined;
            if (position === 'end') this.btnEnd = undefined;
        } catch (error) {
            // console.log(error);
        }
    }
}