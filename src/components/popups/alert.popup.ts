import { Popup } from "../popup";

interface DataWithButton {
    message: string;
    btn: {
        label: string;
        callback: () => void;
    };
}

export class AppAlert extends Popup {
    constructor(confirm?: boolean) {
        super({ btnEnd: confirm || false });
    }

    async render(data: string | DataWithButton) {
        const isObj = typeof data === 'object';
        const flexCenter = this.createFlexCenter();
        const messageEl = this.createElement('div', ['title']);
        messageEl.innerHTML = isObj ? data.message : data;
        flexCenter.appendChild(messageEl);

        if (isObj) {
            const buttonEl = this.createElement('button', ['actionPageButton']);
            buttonEl.textContent = data.btn.label;
            this.addEventListener('click', () => {
                data.btn.callback();
                this.closePage();
            });
            flexCenter.appendChild(buttonEl);
        }

        this.mainArea.appendChild(flexCenter);
    }

    update(data: string): void {
        // console.log(data)
    }
}
