import { Page } from "../../../components/page";
import { ScrollBar } from "../../../components/scroll-bar";
import { SelectItem } from "../../../components/select";
import { MusicController } from "../../../controllers/music.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Artist } from "../../../stores/artist.store";
import { Song } from "../../../stores/songs.store";
// import { OSArray } from "../../../utils/arrays";

export class ArtistPage extends Page {
    private scrollBar?: ScrollBar;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private music: MusicController,
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

    render(artist: Artist) {
        const scrollArea = this.createScrollArea();

        const albumBanner = this.createElement('div', ['albumBanner']);
        albumBanner.innerHTML = `
            <h3 class="albumName">${artist.name}</h3>
        `;

        scrollArea.appendChild(albumBanner);

        const songs = this.music.getSongsByArtist(artist.id);

        if (songs) {
            const playActions = this.createElement('div', ['playActions']);

            const playAll = this.createElement('button', ['playAll']);
            playAll.innerHTML = `
                <span class="material-symbols-outlined icon">play_arrow</span>
                <span>Play</span>
            `;
            const shuffleAll = this.createElement('button', ['shuffleAll']);
            shuffleAll.innerHTML = `
                <span class="material-symbols-rounded">shuffle</span>
                <span>Shuffle</span>
            `;

            this.addEventListener('click', () => {
                this.music.playAll(null, songs);
                this.history.pushState('/player', null);
            }, playAll);

            this.addEventListener('click', () => {
                this.music.playAll(null, songs, true);
                this.history.pushState('/player', null);
            }, shuffleAll);

            playActions.appendChild(playAll);
            playActions.appendChild(shuffleAll);

            scrollArea.appendChild(playActions);

            // const songList = this.createElement('ul', ['titleList', 'songList'], {
            //     style: 'padding-block-end: 0;'
            // });
            // for (const song of OSArray.getFirstElements(songs, 3)) {
            //     const noteTitle = this.createElement('li', ['titleItem']);
            //     noteTitle.innerHTML = `
            //         <span class="albumCover">
            //             <span class="material-symbols-outlined">music_note</span>
            //         </span>
            //         <span class="contactName">${song.title}</span>
            //     `;
            //     this.addEventListener('click', () => {
            //         this.openSongMenu(song);
            //     }, noteTitle);
            //     songList.appendChild(noteTitle);
            // }
            // scrollArea.appendChild(songList);
        }

        const albums = this.music.getAlbumsByArtist(artist.id);

        if (albums.length) {
            const albumList = this.createElement('ul', ['titleList', 'albumList'], {
                style: 'padding-block-start: var(--padding)'
            });
            for (const album of albums) {
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

            // this.createTitle('Albums', scrollArea);
            scrollArea.appendChild(albumList);
        } else {
            this.renderNoData('No Songs', scrollArea);
        }
        this.mainArea.appendChild(scrollArea);
        this.scrollBar?.reCalculate();
    }

    update(_: string, data: Artist) {
        this.mainArea.innerHTML = '';
        this.removeAllEventListeners();
        this.render(data);
    }

    private createTitle(title: string, parentEl: HTMLElement) {
        const titleEl = this.createElement('h2', ['musicTitle']);
        titleEl.textContent = title;
        parentEl.appendChild(titleEl);
    }

    async openSongMenu(song: Song) {
        let list: SelectItem[] = [
            { title: 'Play', value: 'play', icon: 'play_circle' },
            { title: 'Queue', value: 'play-next', icon: 'music_note_add' },
            {
                title: 'Favorite',
                value: 'favorite',
                icon: song.isFavourite ? 'heart_minus' : 'heart_plus'
            },
            { title: 'Playlist', value: 'add', icon: 'playlist_add' },
        ];

        const selected = await this.device.selectList.openPage('Contact', list);
        console.log('SELECTED', selected, song);
        if (selected == 'play') {
            this.music.playMusic(song, [song]);
        } else if (selected == 'play-next') {
            this.music.addPlayNext(song);
        } else if (selected == 'favorite') {
            this.music.toggleSongFavorite(song.id);
        }
    }
}