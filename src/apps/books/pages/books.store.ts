import { Page } from "../../../components/page";
import { HistoryStateManager } from "../../../device/history.manager";


export class BookStorePage extends Page {
    constructor(
        history: HistoryStateManager,
    ) {
        super(history, {})
    }

    render() {}

    update() {}
}