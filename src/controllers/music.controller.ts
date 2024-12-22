// import { MusicService } from "../services/music.service";
import { Album, AlbumStore } from "../stores/album.store";
import { Artist, ArtistStore } from "../stores/artist.store";
import { MusicStore, Music } from '../stores/music.store';
import { Song, SongStore } from "../stores/songs.store";
import { OSAudio } from "../utils/audio";
import { AudioController } from "./audio.controller";
import { BaseController } from "./base.controller";
import { OSArray } from '../utils/arrays';

export interface Library {
    id: string;
    name: string;
    icon: string;
    url: string;
}

export class MusicController extends BaseController {
    private audioId = 'music';

    private artists: Artist[] = [];
    private albums: Album[] = [];
    private songs: Song[] = [];
    private musics: Music[] = [];
    private musicId: string | null = null;
    private _currentSong: Song | undefined;
    private _queue: Song[] = [];

    public repeatOne: boolean = false;
    public audio: OSAudio;

    public libraryList: Library[] = [
        {
            id: 'artists',
            name: 'Artists',
            icon: 'artist',
            url: '/artists'
        },
        {
            id: 'albums',
            name: 'Albums',
            icon: 'album',
            url: '/albums'
        },
        {
            id: 'songs',
            name: 'Songs',
            icon: 'music_note',
            url: '/songs'
        },
        {
            id: 'favourite',
            name: 'Favourites',
            icon: 'favorite',
            url: '/songs'
        },
        {
            id: 'playlist',
            name: 'Playlists',
            icon: 'queue_music',
            url: '/playlists'
        }
    ];

    constructor(
        private artistStore: ArtistStore,
        private albumStore: AlbumStore,
        private songStore: SongStore,
        public musicStore: MusicStore,
        audioController: AudioController
    ) {
        super();
        // this.service = new MusicService(artistStore, albumStore, songStore);
        this.audio = audioController.initAudio(this.audioId);
        this.setupListeners();
        this.addAudioListeners();
    }

    private setupListeners() {
        this.artistStore.listen((artists) => {
            this.artists = artists;
        });

        this.albumStore.listen((albums) => {
            this.albums = albums;
        });

        this.songStore.listen((songs) => {
            this.songs = songs;
        });

        this.musicStore.listen((musics) => {
            this.musics = musics;
        });
    }

    private addAudioListeners() {
        this.audio.e.addEventListener('play', () => {
            console.log('SONG_PLAY_STATUS', 'playing');
            this.notifyListeners('SONG_PLAY_STATUS', 'playing');
        });
        this.audio.e.addEventListener('pause', () => {
            this.notifyListeners('SONG_PLAY_STATUS', 'pauseed');
        });
        this.audio.e.addEventListener('timeupdate', () => {
            this.notifyListeners('SONG_TIMELINE_STATUS', 'timeupdate');
        });
        this.audio.e.addEventListener('ended', () => {
            if (!this.repeatOne) {
                this.notifyListeners('SONG_PLAY_STATUS', 'ended');
                this.playNextSong();
            }
        });
    }

    get list(): Music[] {
        return [
            {
                id: 'songs',
                name: 'Songs',
                currentSongId: null,
                currentTime: 0,
                playType: 'normal',
                songIds: []
            },
            {
                id: 'favourite',
                name: 'Favorite',
                currentSongId: null,
                currentTime: 0,
                playType: 'normal',
                songIds: []
            }
        ];
    }
    get playlist() {
        return this.musics
    }

    get status() {
        return this.audio.status;
    }
    get time() {
        return this.audio.currentTime;
    }
    get duration() {
        return this.audio.duration;
    }
    get albumList() {
        return this.albums
            .sort((a, b) => a.order - b.order)
            .map(album => this.getAlbum(album.id, true))
            .filter(item => !!item);
    }
    get favoriteAlbums() {
        return this.albums
            .filter(item => item.isFavourite)
            .sort((a, b) => a.order - b.order)
            .map(album => this.getAlbum(album.id, true))
            .filter(item => !!item);
    }
    get artistList() {
        return this.artists;
    }
    get currentMusic() {
        if (!this.musicId) return null;
        return this.getMusic(this.musicId)
    }
    get queue() {
        return this._queue;
    }
    set queue(songs: Song[]) {
        this._queue = songs;
    }
    get currentSong(): Song | undefined {
        return this._currentSong;
    }
    set currentSong(song: Song) {
        this.audio.data = song.music;
        this.audio.currentTime = 0;
        this._currentSong = song;
    }

    playMusic(song: Song, songs?: Song[]) {
        if (songs) this.queue = songs;
        this.currentSong = song;

        this.audio.playSong(song.music, 0);
        this.notifyListeners('SONG_CHANGE', this.currentSong);
    }
    addPlayNext(song: Song) {
        if (!this.currentSong) {
            this.queue = [song];
            this.currentSong = song;
        } else {
            this.queue = [...this.queue, song];
        }
    }
    playAll(id: string | null, songs: Song[], isShuffle: boolean = false) {
        const list = isShuffle ? this.shuffleSongs(songs) : songs;
        this.musicId = id;
        this.playMusic(list[0], list);
    }

    recordPlay() {
        if(!this.queue.length) {
            this.playMusic(this.songs[0], this.songs);
        } else {
            this.play();
        }
    }

    play() {
        this.audio.play();
    }
    pause() {
        this.audio.pause();
    }
    seek(time: number) {
        this.audio.currentTime = time;
    }

    playNextSong() {
        if (!this.currentSong) return;
        let index = this.queue.indexOf(this.currentSong);
        if (index == this.queue.length - 1) index = -1;
        const song = this.queue[index + 1];
        this.queue = OSArray.moveFirstToLast(this._queue);
        this.playMusic(song);
    }
    playPrevSong() {
        if (!this.currentSong) return;
        let index = this.queue.indexOf(this.currentSong);
        if (index == 0) index = this.queue.length;
        const song = this.queue[index - 1];
        this.queue = OSArray.moveLastToFirst(this._queue);
        this.playMusic(song);
    }

    updateRepeat() {
        this.repeatOne = !this.repeatOne;
        this.audio.loop = this.repeatOne;
        this.notifyListeners('REPEAT_STATUD', this.repeatOne);
    }
    toggleSongFavorite(songId: string) {
        this.tryThis(async () => {
            const song = this.songs.find(item => item.id == songId);
            if (!song) return;
            song.isFavourite = !song.isFavourite;
            if (this.currentSong && this.currentSong.id == songId) {
                this.notifyListeners('UPDATE_CURRENT_FAVORITE', song.isFavourite);
            }
            await this.songStore.update(song.id, song);
            this.notifyListeners('UPDATE_SONG_FAVORITE', song.id);
        });
    }
    toggleAlbumFavorite(albumId: string) {
        this.tryThis(async () => {
            const album = this.albums.find(item => item.id == albumId);
            if (!album) return;
            album.isFavourite = !album.isFavourite;
            await this.albumStore.update(album.id, album);
            this.notifyListeners('UPDATE_ALBUM_FAVORITE', album.id);
        });
    }

    getAlbums() {
        return this.albums;
    }
    getMusicSongs(id: string) {
        const item = this.list.find(item => item.id == id) as Music;
        if (!item) return null;
        if (item.id == 'songs') {
            const songIds = this.songs.map(item => item.id);
            return { ...item, songIds };
        } else {
            const songIds = this.songs.filter(item => item.isFavourite).map(item => item.id);
            return { ...item, songIds };
        }
    }
    getMusic(id: string) {
        const item = this.musics.find(item => item.id == id) as Music;
        if (!item) return null;
        return item;
    }
    getAlbumsByArtist(artistId: string) {
        return this.albumList.filter(item => item.artistIds.includes(artistId));
    }

    getArtist(id: string) {
        return this.artists.find(item => item.id === id);
    }
    getAlbum(id: string, withSongs: boolean = false) {
        const album = this.albums.find(item => item.id === id);
        if (!album) return;
        if (withSongs) {
            album.artists = album.artistIds.map(id => this.getArtist(id) as Artist) || [];
            album.songs = this.songs.filter(s => s.albumId == album.id).map(song => this.getSong(song.id) as Song);
        }
        return album;
    }
    getSong(id: string) {
        const song = this.songs.find(item => item.id === id);
        if (!song) return null;
        song.album = this.getAlbum(song.albumId);
        song.artists = song.artistIds.map(aid => this.getArtist(aid)).filter(item => !!item);
        return song;
    }

    getSongs(ids: string[], sortKey?: string) {
        const songs = ids.map(id => this.getSong(id)).filter(item => !!item);
        if (sortKey) {
            return songs.sort((a, b) => a.title.localeCompare(b.title));
        }
        return songs;
    }
    getSongsByArtist(artistId: string) {
        const songs = this.songs.filter(song => song.artistIds.includes(artistId))
            .map(song => this.getSong(song.id)).filter(item => !!item);
        return songs;
    }

    clearQueue() {
        if (this._queue.length > 1) {
            this._queue.splice(1);
            this.notifyListeners('QUEUE_CLEAR', null);
        }
    }

    private shuffleSongs(songs: Song[]): Song[] {
        const shuffledSongs = [...songs];

        for (let i = shuffledSongs.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            [shuffledSongs[i], shuffledSongs[randomIndex]] = [shuffledSongs[randomIndex], shuffledSongs[i]];
        }

        return shuffledSongs;
    }
}