import { Page } from "../../../components/page";
import { ScrollBar } from "../../../components/scroll-bar";
import { Library } from "../../../controllers/music.controller";
import { HistoryStateManager } from "../../../device/history.manager";

export class LibraryPage extends Page {
    private scrollBar?: ScrollBar;

    constructor(
        history: HistoryStateManager
    ) {
        super(history, { btnEnd: 'queue_music' });
        this.component.classList.add('musicPage');
        this.init();

        this.scrollBar = new ScrollBar(this.component);
    }

    private init() {
        this.addEventListener('click', () => {
            this.history.pushState('/queue', null);
        }, this.btnEnd, false);
    }

    render(data: Library[]) {
        console.log(data);
        const scrollArea = this.createScrollArea();

        const libraryList = this.createElement('ul', ['libraryList']);

        for (const library of data) {
            const libraryItem = this.createElement('li', ['libraryItem']);

            const itemBtn = this.createElement('button', ['libraryButton']);
            itemBtn.innerHTML = `
                <span class="material-symbols-outlined icon">${library.icon}</span>
                <div class="itemName">${library.name}</div>
                <span class="material-symbols-outlined icon--ssm">arrow_forward_ios</span>
            `;

            this.addEventListener('click', () => {
                this.history.pushState(library.url, library.id);
            }, itemBtn);

            libraryItem.appendChild(itemBtn);
            libraryList.appendChild(libraryItem);
        }

        scrollArea.appendChild(libraryList);
        this.mainArea.appendChild(scrollArea);
        this.scrollBar?.reCalculate();
    }

    update(_: string, data: Library[]) {
        this.mainArea.innerHTML = '';
        this.removeAllEventListeners();
        this.render(data);
    }
}