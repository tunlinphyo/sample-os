import { Page } from "../../../components/page";
import { ScrollBar } from "../../../components/scroll-bar";
import { MusicController } from "../../../controllers/music.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Music } from "../../../stores/music.store";

export class PlaylistsPage extends Page {
    private scrollBar?: ScrollBar;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private music: MusicController,
    ) {
        super(history, { btnEnd: 'add' });
        this.component.classList.add('albumsPage');
        this.init();

        this.scrollBar = new ScrollBar(this.component);
    }

    private init() {
        this.addEventListener('click', () => {
            this.history.pushState('/contacts/new', null);
        }, this.btnEnd, false);

        // const musicListener = (status: string) => {
        //     console.log(status);
        // };

        // this.music.addChangeListener(musicListener);

        // this.device.addEventListener('closeApp', () => {
        //     this.music.removeChangeListener(musicListener);
        // });
    }

    render(list: Music[]) {
        const scrollArea = this.createScrollArea();

        if (list.length) {
            const noteList = this.createElement('ul', ['titleList', 'playlistList']);
            for (const item of list) {
                const artistName = this.createElement('li', ['titleItem']);
                artistName.innerHTML = `
                    <span class="thumbnail">
                        <span class="material-symbols-outlined icon">graphic_eq</span>
                    </span>
                    <span>${item.name}</span>
                `;
                this.addEventListener('click', () => {
                    this.history.pushState(`/playlist`, item.id);
                }, artistName);
                noteList.appendChild(artistName);
            }
            scrollArea.appendChild(noteList);
        } else {
            return this.renderNoData('Add Playlist');
        }

        this.mainArea.appendChild(scrollArea);
        this.scrollBar?.reCalculate();
    }

    update(_: string, data: Music[]) {
        this.mainArea.innerHTML = '';
        this.removeAllEventListeners();
        this.render(data);
    }
}