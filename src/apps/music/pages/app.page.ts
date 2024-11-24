import { App } from "../../../components/app";
import { ScrollBar } from "../../../components/scroll-bar";
import { MusicController } from "../../../controllers/music.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Music } from "../../../stores/music.store";

export class MusicApp extends App {
    private scrollBar: ScrollBar;
    private playerBtn: HTMLButtonElement;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private music: MusicController,
    ) {
        super(history, { btnStart: 'queue_music', btnEnd: 'library_music' });
        this.component.classList.add('latestPage');
        this.playerBtn = this.createPlayer();
        this.component.appendChild(this.playerBtn);
        this.init();
        this.render(music.list);

        this.scrollBar = new ScrollBar(this.component);
    }

    private init() {
        this.addEventListener('click', () => {
            this.history.pushState('/player', null);
        }, this.playerBtn, false);

        this.addEventListener('click', () => {
            this.history.pushState('/library', null);
        }, this.btnEnd, false);

        // this.addEventListener('click', () => {
        //     this.history.pushState('/dialpad', null);
        // }, this.btnStart, false);

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
        const scrollArea = this.createScrollArea();

        const musicList = this.createElement('ul', ['musicList']);

        for (const music of list) {
            const musicCard = this.createElement('li', ['musicCard']);

            const backgroundEl = this.createElement('div', ['backgroundEl']);
            const albumEl = this.createElement('button', ['albumEl']);
            albumEl.innerHTML = `
                <h3 class="albumName">${music.name}</h3>
            `;

            const playButton = this.createElement('button', ['playButton']);
            playButton.innerHTML = `<span class="material-symbols-rounded icon">shuffle</span>`;

            musicCard.appendChild(backgroundEl);
            musicCard.appendChild(albumEl);
            musicCard.appendChild(playButton);

            this.addEventListener('click', () => {
                this.history.pushState('/playlist', music.id);
            }, albumEl);

            this.addEventListener('click', () => {
                const songs = this.music.getSongs(music.songIds);
                if (songs.length) this.music.playAll(music.id, songs, true);
                this.history.pushState('/player', null);
            }, playButton);

            musicList.appendChild(musicCard);
        }

        // const albumList = this.createElement('ul', ['musicList', 'albumList']);

        // for (const album of this.music.albumList) {
        //     const musicCard = this.createElement('li', ['musicCard', 'albumCard']);

        //     const backgroundEl = this.createElement('div', ['backgroundEl']);
        //     const albumEl = this.createElement('button', ['albumEl']);
        //     albumEl.innerHTML = `
        //         <h3 class="albumName">${album.name}</h3>
        //     `;

        //     const playButton = this.createElement('button', ['playButton']);
        //     playButton.innerHTML = `<span class="material-symbols-outlined icon">play_circle</span>`;

        //     musicCard.appendChild(backgroundEl);
        //     musicCard.appendChild(albumEl);
        //     musicCard.appendChild(playButton);

        //     this.addEventListener('click', () => {
        //         // this.music.playMusic(song, songs);
        //         this.history.pushState('/albums/detail', album.id);
        //     }, albumEl);

        //     this.addEventListener('click', () => {
        //         // this.music.playMusic(song, songs);
        //         this.history.pushState('/player', null);
        //     }, playButton);

        //     albumList.appendChild(musicCard);
        // }
        const albumList = this.createElement('ul', ['titleList', 'albumList']);

        for (const album of this.music.albumList) {
            const albumEl = this.createElement('li', ['albumCard']);

            const albumRecord = this.createElement('div', ['albumRecord']);
            albumRecord.innerHTML = `
                <span class="record">
                    <span class="material-symbols-outlined">music_note</span>
                </span>
            `;

            const albumBtn = this.createElement('button', ['albumButton']);
            const artists = album.artists?.map(artist => artist.name) || [];
            albumBtn.innerHTML = `
                <div class="albumName">${album.name}</div>
                <div class="artists">${artists.join(', ')}</div>
            `;

            this.addEventListener('click', () => {
                this.history.pushState('/albums/detail', album.id);
            }, albumBtn);

            albumEl.appendChild(albumRecord);
            albumEl.appendChild(albumBtn);
            albumList.appendChild(albumEl);
        }

        scrollArea.appendChild(musicList);
        scrollArea.appendChild(albumList);
        this.mainArea.appendChild(scrollArea);
        this.scrollBar?.reCalculate();
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
}