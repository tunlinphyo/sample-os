import { Modal } from "../../../components/modal";
import { ScrollBar } from "../../../components/scroll-bar";
import { MusicController } from "../../../controllers/music.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Song } from "../../../stores/songs.store";
import { SortableList } from "../../../utils/sortable";

export class QueuePage extends Modal {
    private scrollBar?: ScrollBar;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private music: MusicController,
    ) {
        super(history, { btnStart: 'music_note', btnEnd: 'playlist_remove' });
        this.component.classList.add('queuePage');
        this.init();

        this.scrollBar = new ScrollBar(this.component);
    }

    private init() {
        this.addEventListener('click', async () => {
            this.history.pushState('/player', null);
        }, this.btnStart, false);

        this.addEventListener('click', async () => {
            const result = await this.device.confirmPopup.openPage('Clear queue', 'Are you sure to clear queue!');
            if (result) this.music.clearQueue();
        }, this.btnEnd, false);

        const musicListener = (status: string) => {
            if (status == 'SONG_CHANGE' || status == 'QUEUE_CLEAR') {
                this.update('update', this.music.queue);
            }
        };

        this.music.addChangeListener(musicListener);

        this.device.addEventListener('closeApp', () => {
            this.music.removeChangeListener(musicListener);
        });
    }

    render(list: Song[]) {
        const scrollArea = this.createScrollArea();

        if (list.length) {
            const songList = this.createElement('ul', ['titleList', 'songList', 'noPadding']);

            const noteTitle = this.createElement('li', ['titleItem']);
            noteTitle.innerHTML = `
                <span class="albumCover">
                    <span class="material-symbols-outlined">music_note</span>
                </span>
                <span class="contactName">${list[0].title}</span>
            `;
            const spreadItem = this.createElement('li', ['spreadItem']);
            songList.appendChild(noteTitle);
            songList.appendChild(spreadItem);

            scrollArea.appendChild(songList);

            const queueList = this.createElement<HTMLUListElement>('ul', ['titleList', 'songList', 'noPadding'], { id: 'sortable-list' });
            list.forEach((song, index) => {
                if (index) {
                    const noteTitle = this.createElement('li', ['titleItem'], { 'data-id': song.id });
                    noteTitle.innerHTML = `
                        <span class="material-symbols-outlined grab">drag_handle</span>
                        <span class="contactName">${song.title}</span>
                    `;
                    queueList.appendChild(noteTitle);
                }
            })
            scrollArea.appendChild(queueList);
        } else {
            this.renderNoData('Playing No Song');
        }


        if (list.length) {
            this.mainArea.appendChild(scrollArea);
            this.scrollBar?.reCalculate();

            new SortableList('sortable-list');

            this.addEventListener('dataIndexUpdated', (event) => {
                this.getSongList(list[0].id, event.target as HTMLUListElement);
            }, this.getElement('#sortable-list'));
        }
    }

    update(_: string, data: Song[]) {
        this.mainArea.innerHTML = '';
        this.removeAllEventListeners();
        this.render(data);
    }

    private getSongList(currentId: string, elem: HTMLUListElement) {
        const newArray = [currentId];
        Array.from(elem.children).forEach((item) => {
            const el = item as HTMLLIElement;
            newArray.push(el.dataset.id as string);
        })
        this.music.queue = this.music.getSongs(newArray)
    }
}