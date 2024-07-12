import { KeyboardBase, KeyboardCallback } from "./base";

export class EnNumberKeyboard extends KeyboardBase {
    private callback: KeyboardCallback | undefined;

    constructor(component: HTMLElement) {
        super(component);
        this.render();
    }

    private render() {
        this.removeAllEventListeners();
        this.component.innerHTML = '';
        this.renderKeys();
    }

    public onKey(callback: KeyboardCallback) {
        this.callback = callback;
    }

    private handleKeyEnter(data: string) {
        if (this.callback) this.callback(data);
    }

    private renderKeys() {
        const keys = [1,2,3,4,5,6,7,8,9];
        const numberPad = this.createElement('div', ['numberPad']);
        for(const key of keys) {
            const keyEl = this.createElement('button', ['numKey', 'withBorder']);
            keyEl.textContent = key.toString();
            this.addEventListener('click', () => {
                this.handleKeyEnter(key.toString());
            }, keyEl);
            numberPad.appendChild(keyEl);
        }
        const emptyEl = this.createElement('button', ['numKey']);
        numberPad.appendChild(emptyEl);

        const zeroEl = this.createElement('button', ['numKey', 'withBorder']);
        zeroEl.textContent = '0';
        this.addEventListener('click', () => {
            this.handleKeyEnter('0');
        }, zeroEl);
        numberPad.appendChild(zeroEl);

        const deleteEl = this.createElement('button', ['numKey']);
        deleteEl.innerHTML = '<span class="material-symbols-rounded icon" style="font-size: 30px; rotate: -90deg;">change_history</span>';
        this.addEventListener('click', () => {
            this.handleKeyEnter('DELETE');
        }, deleteEl);
        numberPad.appendChild(deleteEl);

        this.component.appendChild(numberPad);
    }
}