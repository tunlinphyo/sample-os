import { Page } from "../../../components/page";
import { ScrollBar } from "../../../components/scroll-bar";
import { MusicController } from "../../../controllers/music.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Artist } from "../../../stores/artist.store";

export class ArtistsPage extends Page {
    private scrollBar?: ScrollBar;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private music: MusicController,
    ) {
        super(history, { btnEnd: 'queue_music' });
        this.component.classList.add('albumsPage');
        this.init();

        this.scrollBar = new ScrollBar(this.component);
    }

    private init() {
        this.addEventListener('click', () => {
            this.history.pushState('/queue', null);
        }, this.btnEnd, false);

        // const musicListener = (status: string) => {
        //     console.log(status);
        // };

        // this.music.addChangeListener(musicListener);

        // this.device.addEventListener('closeApp', () => {
        //     this.music.removeChangeListener(musicListener);
        // });
    }

    render(list: Artist[]) {
        const scrollArea = this.createScrollArea();
        const noteList = this.createElement('ul', ['titleList', 'artistList']);
        list.forEach(item => {
            const artistName = this.createElement('li', ['titleItem']);
            artistName.innerHTML = `
                <span class="thumbnail">
                    <span class="material-symbols-outlined icon">artist</span>
                </span>
                <span>${item.name}</span>
            `;
            this.addEventListener('click', () => {
                this.history.pushState(`/artist`, item.id);
            }, artistName);
            noteList.appendChild(artistName);
        });
        scrollArea.appendChild(noteList);
        this.mainArea.appendChild(scrollArea);
        this.scrollBar?.reCalculate();
    }

    update(_: string, data: Artist[]) {
        this.mainArea.innerHTML = '';
        this.removeAllEventListeners();
        this.render(data);
    }
}