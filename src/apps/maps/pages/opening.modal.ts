import { Modal } from "../../../components/modal";
import { HistoryStateManager } from "../../../device/history.manager";
import { convertToAbbreviatedDay } from "../services/map.styles";
import { Schedule } from "./place.page";

export class OpeningHours extends Modal {
    constructor(
        history: HistoryStateManager
    ) {
        super(history, {});
    }

    render(data: Schedule[]) {
        const scrollArea = this.createScrollArea();
        const contantArea = this.createElement('div', ['contantArea']);

        for(const { day, time } of data) {
            const dayTime = this.createElement('div', ['dayTime']);
            dayTime.innerHTML = `
                <span class="day">${convertToAbbreviatedDay(day)}</span>
                <span class="time">${time.replace(',', '<br>')}</span>
            `;
            contantArea.appendChild(dayTime);
        }

        scrollArea.appendChild(contantArea);
        this.mainArea.appendChild(scrollArea);
    }

    update() {}
}
