import { App } from "../../../components/app";
// import { ScrollBar } from "../../../components/scroll-bar";
import { MusicController } from "../../../controllers/music.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Music } from "../../../stores/music.store";

export class MusicApp extends App {
    // private scrollBar: ScrollBar;
    private playerBtn: HTMLButtonElement;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private music: MusicController,
    ) {
        super(history, { btnEnd: 'art_track' });
        this.component.classList.add('musicRecoderPage');
        this.playerBtn = this.createPlayer();
        this.component.appendChild(this.playerBtn);
        this.init();
        this.render(music.list);

        // this.scrollBar = new ScrollBar(this.component);
    }

    private init() {
        // this.addEventListener('click', () => {
        //     this.history.pushState('/player', null);
        // }, this.playerBtn, false);

        // this.addEventListener('click', () => {
        //     this.history.pushState('/queue', null);
        // }, this.btnEnd, false);

        this.addEventListener('click', () => {
            this.history.pushState('/albums', null);
        }, this.btnEnd, false);

        const musicListener = (status: string, data: any) => {
            if (status === "LATEST_CHANGE") {
                this.update('update', data);
            }
            if (status === 'SONG_PLAY_STATUS') {
                if (data === 'playing') {
                    this.component.classList.add('playing');
                } else {
                    this.component.classList.remove('playing');
                }
            }
            if (status === 'UPDATE_ALBUM_FAVORITE') {
                this.update('update', this.music.list);
            }
        };

        if (this.music.status == 'playing') {
            this.component.classList.add('playing');
        }

        this.music.addChangeListener(musicListener);

        this.device.addEventListener('closeApp', () => {
            this.music.removeChangeListener(musicListener);
        });
    }

    render(list: Music[]) {
        console.log(list);

        const recoder = this.createElement('div', ['musicRecoder']);

        recoder.innerHTML = `
            <div class="recordContainer">
                <div class="record">
                    <div class="recordCenter"></div>
                    <div class="time timeCurrent">0:24</div>
                    <div class="time timeDuration">3:52</div>
                </div>
            </div>
            <div class="recordActions">
                <div class="musicControl">
                    <button class="btnPrev">
                        <span class="material-symbols-outlined icon fill-icon">skip_previous</span>
                    </button>
                    <button class="btnPlay">
                        <span class="material-symbols-outlined icon fill-icon">stop</span>
                    </button>
                    <button class="btnNext">
                        <span class="material-symbols-outlined icon fill-icon">skip_next</span>
                    </button>
                </div>
                <div class="playHand">
                    <div class="playHandCircle">
                        <div class="playHandStick"></div>
                    </div>
                    <button class="playButton">
                        <span class="material-symbols-outlined icon">queue_music</span>
                    </button>
                </div>
            </div>
        `;

        this.mainArea.appendChild(recoder);
        // const scrollArea = this.createScrollArea();

        // const musicList = this.createElement('ul', ['musicList']);

        // for (const music of list) {
        //     const musicCard = this.createElement('li', ['musicCard']);

        //     const backgroundEl = this.createElement('div', ['backgroundEl']);
        //     backgroundEl.innerHTML = `
        //         <div class="diamondCard">
        //             <span class="material-symbols-outlined icon">music_note</span>
        //         </div>
        //     `;
        //     const albumEl = this.createElement('button', ['albumEl']);
        //     albumEl.innerHTML = `
        //         <h3 class="albumName">${music.name}</h3>
        //     `;

        //     const playButton = this.createElement('button', ['playButton']);
        //     playButton.innerHTML = `<span class="material-symbols-rounded icon--sm">play_arrow</span>`;

        //     musicCard.appendChild(backgroundEl);
        //     musicCard.appendChild(albumEl);
        //     musicCard.appendChild(playButton);

        //     this.addEventListener('click', () => {
        //         this.history.pushState('/songs', music.id);
        //     }, albumEl);

        //     this.addEventListener('click', () => {
        //         const musicSongs = this.music.getMusicSongs(music.id);
        //         if (!musicSongs) return;
        //         const songs = this.music.getSongs(musicSongs.songIds);
        //         if (songs.length) this.music.playAll(music.id, songs, true);
        //         // this.history.pushState('/player', null);
        //     }, playButton);

        //     musicList.appendChild(musicCard);
        // }

        // const albumList = this.createElement('ul', ['titleList', 'albumList']);

        // for (const album of this.music.favoriteAlbums) {
        //     const albumEl = this.createElement('li', ['albumCard']);

        //     const albumRecord = this.createElement('div', ['albumRecord']);
        //     albumRecord.innerHTML = `
        //         <span class="record">
        //             <span class="material-symbols-outlined">music_note</span>
        //         </span>
        //     `;

        //     const albumBtn = this.createElement('button', ['albumButton']);
        //     const artists = album.artists?.map(artist => artist.name) || [];
        //     albumBtn.innerHTML = `
        //         <div class="albumName">${album.name}</div>
        //         <div class="artists">${artists.join(', ')}</div>
        //     `;

        //     this.addEventListener('click', () => {
        //         this.history.pushState('/albums/detail', album.id);
        //     }, albumBtn);

        //     albumEl.appendChild(albumRecord);
        //     albumEl.appendChild(albumBtn);
        //     albumList.appendChild(albumEl);
        // }

        // scrollArea.appendChild(musicList);
        // this.createTitle('Albums', scrollArea);
        // scrollArea.appendChild(albumList);
        // this.mainArea.appendChild(scrollArea);
        // this.scrollBar?.reCalculate();
    }

    update(_: string, data: Music[]) {
        this.mainArea.innerHTML = '';
        this.removeAllEventListeners();
        this.render(data);
    }

    private createPlayer() {
        const playerBtn = this.createElement<HTMLButtonElement>('button', ['playerButton']);
        playerBtn.innerHTML = `<span class="material-symbols-outlined icon">music_note</span>`;

        return playerBtn;
    }

    private createTitle(title: string, parentEl: HTMLElement) {
        const titleEl = this.createElement('h2', ['musicTitle']);
        titleEl.textContent = title;
        parentEl.appendChild(titleEl);
    }
}