import { KeyboardBase, KeyboardCallback } from "./base";
// import { EmojiKeyboard } from "./emoji.keyboard";

export class EnTextKeyboard extends KeyboardBase {
    private isCaps: boolean = false;
    private isNumbers: boolean = false;
    // private emoji: EmojiKeyboard;

    private firstTextKeys = [
        { text: 'Q', value: 'q' },
        { text: 'W', value: 'w' },
        { text: 'E', value: 'e' },
        { text: 'R', value: 'r' },
        { text: 'T', value: 't' },
        { text: 'Y', value: 'y' },
        { text: 'U', value: 'u' },
        { text: 'I', value: 'i' },
        { text: 'O', value: 'o' },
        { text: 'P', value: 'p' },
    ];
    private firstNumberKeys = [
        { text: '1', value: '1' },
        { text: '2', value: '2' },
        { text: '3', value: '3' },
        { text: '4', value: '4' },
        { text: '5', value: '5' },
        { text: '6', value: '6' },
        { text: '7', value: '7' },
        { text: '8', value: '8' },
        { text: '9', value: '9' },
        { text: '0', value: '0' },
    ];
    private firstSymbolKeys = [
        { text: '[', value: '[' },
        { text: ']', value: ']' },
        { text: '{', value: '{' },
        { text: '}', value: '}' },
        { text: '#', value: '#' },
        { text: '%', value: '%' },
        { text: '^', value: '^' },
        { text: '*', value: '*' },
        { text: '+', value: '+' },
        { text: '=', value: '=' },
    ];
    private secondTextKeys = [
        { text: 'A', value: 'a' },
        { text: 'S', value: 's' },
        { text: 'D', value: 'd' },
        { text: 'F', value: 'f' },
        { text: 'G', value: 'g' },
        { text: 'H', value: 'h' },
        { text: 'J', value: 'j' },
        { text: 'K', value: 'k' },
        { text: 'L', value: 'l' },
    ];
    private secondNumberKeys = [
        { text: '-', value: '-' },
        { text: '/', value: '/' },
        { text: ':', value: ':' },
        { text: ';', value: ';' },
        { text: '(', value: '(' },
        { text: ')', value: ')' },
        { text: '¥', value: '¥' },
        { text: '&', value: '&' },
        { text: '@', value: '@' },
        { text: '&quot;', value: '&quot;' },
    ];
    private secondSymbolKeys = [
        { text: '_', value: '-' },
        { text: '\\', value: '\\' },
        { text: '|', value: '|' },
        { text: '~', value: '~' },
        { text: '&lt;', value: '&lt;' },
        { text: '&gt;', value: '&gt;' },
        { text: '$', value: '$' },
        { text: '€', value: '€' },
        { text: '£', value: '£' },
        { text: '•', value: '•' },
    ];
    private thirdTextKeys = [
        {
            text: '<span class="material-symbols-rounded icon" style="font-size: 30px;">change_history</span>',
            value: 'CAPS',
            className: 'keyCaps',
        },
        { text: 'Z', value: 'z' },
        { text: 'X', value: 'x' },
        { text: 'C', value: 'c' },
        { text: 'V', value: 'v' },
        { text: 'B', value: 'b' },
        { text: 'N', value: 'n' },
        { text: 'M', value: 'm' },
        {
            text: '<span class="material-symbols-rounded icon" style="font-size: 30px; rotate: -90deg;">change_history</span>',
            value: 'DELETE',
            className: 'keyDelete',
        },
    ];
    private thirdNumberKeys = [
        {
            text: '<span class="material-symbols-rounded icon" style="font-size: 30px;">change_history</span>',
            value: 'CAPS',
            className: 'keyCaps',
        },
        { text: '.', value: '.' },
        { text: ',', value: ',' },
        { text: '?', value: '?' },
        { text: '!', value: '!' },
        { text: '\'', value: '\'' },
        {
            text: '<span class="material-symbols-rounded icon" style="font-size: 30px; rotate: -90deg;">change_history</span>',
            value: 'DELETE',
            className: 'keyDelete',
        },
    ];

    private callback: KeyboardCallback | undefined;

    constructor(component: HTMLElement) {
        super(component);
        this.render();
        this.handleKeyEnter = this.handleKeyEnter.bind(this);
        // this.emoji = new EmojiKeyboard();
    }

    private render() {
        this.removeAllEventListeners();
        this.component.innerHTML = '';
        this.renderRow('firstRow', this.firstTextKeys);
        this.renderRow('secondRow', this.secondTextKeys);
        this.renderRow('thirdRow', this.thirdTextKeys);
        this.renderLastRow();
        this.handleCaps();
    }

    public onKey(callback: KeyboardCallback) {
        this.callback = callback;
    }

    private async handleKeyEnter(data: string) {
        if (data === ' ') {
            this.handleSpace();
        }
        if (data === 'NUMBER') {
            this.handleNumber();
        } else if (data === 'CAPS') {
            this.handleCaps();
        } else if (data === 'EMOJI') {
            // const result = await this.emoji.openPage<string>('Emoji');
            // console.log('EMOJI', result);
            // if (result && typeof result !== 'boolean') {
            //     if (this.callback) this.callback(result);
            // }
        } else {
            if (this.callback) this.callback(this.isCaps ? data.toUpperCase() : data);
            if (!(this.isNumbers || this.isCaps)) this.handleCaps();
        }
    }

    private handleNumber() {
        this.isNumbers = !this.isNumbers;
        this.isCaps = false;
        const numberKey = this.getElement('.keyNumber');
        if (this.isNumbers) {
            numberKey.textContent = 'ABC';
            this.renderRow('firstRow', this.firstNumberKeys);
            this.renderRow('secondRow', this.secondNumberKeys, 'withNumber');
            this.renderRow('thirdRow', this.thirdNumberKeys, 'withNumber');
        } else {
            numberKey.textContent = '123';
            this.renderRow('firstRow', this.firstTextKeys);
            this.renderRow('secondRow', this.secondTextKeys);
            this.renderRow('thirdRow', this.thirdTextKeys);
        }
    }

    private handleCaps() {
        this.isCaps = !this.isCaps;

        if (this.isNumbers) {
            if (this.isCaps) {
                this.renderRow('firstRow', this.firstSymbolKeys);
                this.renderRow('secondRow', this.secondSymbolKeys, 'withNumber');
            } else {
                this.renderRow('firstRow', this.firstNumberKeys);
                this.renderRow('secondRow', this.secondNumberKeys, 'withNumber');
            }
        } else {
            this.renderRow('firstRow', this.firstTextKeys);
            this.renderRow('secondRow', this.secondTextKeys);
            this.renderRow('thirdRow', this.thirdTextKeys);
        }

        const capsKey = this.getElement('.keyCaps');
        if (this.isCaps) capsKey.classList.add('fill-icon');
        else capsKey.classList.remove('fill-icon');
    }

    private handleSpace() {
        if (this.isCaps || this.isNumbers) {
            if (this.isNumbers) {
                this.isNumbers = false;
                this.isCaps = false;
                const numberKey = this.getElement('.keyNumber');
                numberKey.textContent = '123';
                this.renderRow('firstRow', this.firstTextKeys);
                this.renderRow('secondRow', this.secondTextKeys);
                this.renderRow('thirdRow', this.thirdTextKeys);
            } else if (this.isCaps) {
                this.handleCaps();
            }
        }
    }

    private renderLastRow() {
        const rowEl = this.createElement('div', ['keyboardRow', 'lastRow']);

        const numberEl = this.createElement('button', ['key', 'small', 'keyNumber']);
        numberEl.textContent = this.isNumbers ? 'ABC' : '123';
        rowEl.appendChild(numberEl);
        this.addEventListener('click', () => {
            this.handleKeyEnter('NUMBER');
        }, numberEl);

        const emojiEl = this.createElement('button', ['key', 'keyEmoji']);
        emojiEl.innerHTML = '<span class="material-symbols-outlined">mood</span>';
        rowEl.appendChild(emojiEl);
        this.addEventListener('click', () => {
            this.handleKeyEnter('EMOJI');
        }, emojiEl);

        const spaceEl = this.createElement('button', ['key', 'space', 'keySpace']);
        rowEl.appendChild(spaceEl);
        this.addEventListener('click', () => {
            this.handleKeyEnter(' ');
        }, spaceEl);

        const enterEl = this.createElement('button', ['key', 'small', 'keyEnter'])
        enterEl.textContent = 'ENTER';
        rowEl.appendChild(enterEl);
        this.addEventListener('click', () => {
            this.handleKeyEnter('ENTER');
        }, enterEl);

        this.component.appendChild(rowEl);
    }

    private renderRow(className: string, keys: { text: string, value: string, className?: string }[], extraClass?: string) {
        const rowEl = extraClass
            ? this.createElement('div', ['keyboardRow', className, extraClass])
            : this.createElement('div', ['keyboardRow', className]);

        for(const key of keys) {
            const keyEl = this.createElement('button', ['key', key.className || 'keyText']);
            if (key.className) {
                keyEl.innerHTML = key.text;
            } else {
                keyEl.innerHTML = this.isCaps ? key.text.toUpperCase() : key.text.toLowerCase();
            }
            this.addEventListener('click', () => {
                // this.dispatchCustomEvent('onKey', key.value)
                this.handleKeyEnter(key.value);
            }, keyEl);
            rowEl.appendChild(keyEl);
        }

        try {
            const existEl = this.getElement(`.keyboardRow.${className}`);
            this.replaceElement(existEl, rowEl);
        } catch(_) {
            this.component.appendChild(rowEl);
        }
    }

}
