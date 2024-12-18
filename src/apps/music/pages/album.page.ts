import { Page } from "../../../components/page";
import { ScrollBar } from "../../../components/scroll-bar";
import { SelectItem } from "../../../components/select";
import { MusicController } from "../../../controllers/music.controller";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { Album } from "../../../stores/album.store";
import { Song } from "../../../stores/songs.store";

export class AlbumPage extends Page {
    private scrollBar?: ScrollBar;
    private _album: Album | undefined;

    constructor(
        history: HistoryStateManager,
        private device: DeviceController,
        private music: MusicController,
    ) {
        super(history, { btnEnd: 'favorite' });
        this.component.classList.add('musicPage');
        this.init();

        this.scrollBar = new ScrollBar(this.component);
    }

    private init() {
        this.addEventListener('click', () => {
            if (this._album) this.music.toggleAlbumFavorite(this._album.id);
        }, this.btnEnd, false);

        const musicListener = (status: string, data: any) => {
            if (status === 'UPDATE_ALBUM_FAVORITE' && this._album && this._album.id == data) {
                this.toggleFavorite(this._album.isFavourite);
            }
        };

        this.music.addChangeListener(musicListener);

        this.device.addEventListener('closeApp', () => {
            this.music.removeChangeListener(musicListener);
        });
    }

    render(album: Album) {
        this._album = album;
        const scrollArea = this.createScrollArea();

        const albumBanner = this.createElement('div', ['albumBanner']);
        const artists = album.artists?.map(artist => artist.name) || [];
        albumBanner.innerHTML = `
            <h3 class="albumName">${album.name}</h3>
            <div class="artists">${artists.join(', ')}</div>
        `;

        scrollArea.appendChild(albumBanner);

        if (album.songs && album.songs.length) {
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
                this.music.playAll(null, album.songs as Song[]);
                this.history.pushState('/player', null);
            }, playAll);

            this.addEventListener('click', () => {
                this.music.playAll(null, album.songs as Song[], true);
                this.history.pushState('/player', null);
            }, shuffleAll);

            playActions.appendChild(playAll);
            playActions.appendChild(shuffleAll);

            scrollArea.appendChild(playActions);
        } else {
            this.renderNoData('No Songs', scrollArea);
        }

        const songList = this.createElement('ul', ['titleList', 'songList']);
        if (album.songs) {
            for (const song of album.songs) {
                const noteTitle = this.createElement('li', ['titleItem']);
                noteTitle.innerHTML = `
                    <span class="albumCover">
                        <span class="material-symbols-outlined">music_note</span>
                    </span>
                    <span class="contactName">${song.title}</span>
                `;
                this.addEventListener('click', () => {
                    // this.music.playMusic(song, album.songs);
                    // this.history.pushState('/player', null);
                    this.openSongMenu(song);
                }, noteTitle);
                songList.appendChild(noteTitle);
            }
        }

        this.toggleFavorite(album.isFavourite);

        scrollArea.appendChild(songList);
        this.mainArea.appendChild(scrollArea);
        // if (!this.scrollBar) {
        //     this.scrollBar = new ScrollBar(this.component);
        // } else {
        // }
        this.scrollBar?.reCalculate();
    }

    update(_: string, data: Album) {
        this.mainArea.innerHTML = '';
        this.removeAllEventListeners();
        this.render(data);
    }

    private async openSongMenu(song: Song) {
        let list: SelectItem[] = [
            { title: 'Play', value: 'play', icon: 'play_circle' },
            { title: 'Play After', value: 'play-next', icon: 'music_note_add' },
            {
                title: song.isFavourite ? 'Remove Favorite' : 'Favorite',
                value: 'favorite',
                icon: 'favorite'
            },
            { title: 'Playlist', value: 'add', icon: 'playlist_add' },
        ];

        const selected = await this.device.selectList.openPage('Contact', list);
        console.log('SELECTED', selected, song);
        if (selected == 'play') {
            this.music.playMusic(song, [song]);
            // this.history.pushState('/player', null);
        } else if (selected == 'play-next') {
            this.music.addPlayNext(song);
        } else if (selected == 'favorite') {
            this.music.toggleSongFavorite(song.id);
        }
    }

    private toggleFavorite(isFvorite: boolean) {
        if (!this.btnEnd) return;
        const icon = this.btnEnd.querySelector('.icon');
        if (isFvorite) icon?.classList.add('fill-icon');
        else icon?.classList.remove('fill-icon');
    }
}