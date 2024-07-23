import { Page } from "../../../components/page";
import { HistoryStateManager } from "../../../device/history.manager";


export class BookStorePage extends Page {
    constructor(
        history: HistoryStateManager,
    ) {
        super(history, {})
    }

    render() {
        const flexCenter = this.createFlexCenter();

        const message = this.createElement('div', ['message']);
        message.textContent = 'Coming soon..';

        flexCenter.appendChild(message);
        this.mainArea.appendChild(flexCenter);
    }

    update() {}
}