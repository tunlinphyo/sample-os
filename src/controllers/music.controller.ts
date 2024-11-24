// import { MusicService } from "../services/music.service";
import { Album, AlbumStore } from "../stores/album.store";
import { Artist, ArtistStore } from "../stores/artist.store";
import { MusicStore, Music } from '../stores/music.store';
import { Song, SongStore } from "../stores/songs.store";
import { OSAudio } from "../utils/audio";
import { AudioController } from "./audio.controller";
import { BaseController } from "./base.controller";

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

    // private service: MusicService;

    public currentSong: Song | null = null;
    public playList: Song[] = [];

    public audio: OSAudio;

    public libraryList: Library[] = [
        {
            id: 'playlist',
            name: 'Playlists',
            icon: 'queue_music',
            url: '/playlist'
        },
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
            url: '/playlist'
        },
        {
            id: 'favourite',
            name: 'Favourites',
            icon: 'favorite',
            url: '/playlist'
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
            this.notifyListeners('SONG_PLAY_STATUS', 'playing');
        });
        this.audio.e.addEventListener('pause', () => {
            this.notifyListeners('SONG_PLAY_STATUS', 'pauseed');
        });
        this.audio.e.addEventListener('timeupdate', () => {
            this.notifyListeners('SONG_TIMELINE_STATUS', 'timeupdate');
        });
        this.audio.e.addEventListener('ended', () => {
            this.notifyListeners('SONG_PLAY_STATUS', 'ended');
            this.playNextSong();
        });
    }

    get latest() {
        return this.songs.map(song => this.getSong(song.id)).filter(item => !!item);
    }
    get list() {
        return this.musics
        .sort((a, b) => a.order - b.order)
        .map(item => {
            if (item.type == 'all') {
                const songIds = item.songIds.length ? item.songIds : this.songs.map(song => song.id);
                return { ...item, songIds }
            } else {
                return item;
            }
        })
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
    get currentMusic() {
        if (!this.musicId) return null;
        return this.getMusic(this.musicId)
    }

    playMusic(song: Song, songs?: Song[]) {
        this.currentSong = song;
        if (songs) this.playList = songs;

        this.audio.playSong(song.music, 0);
        this.notifyListeners('SONG_CHANGE', this.currentSong);
    }
    playAll(id: string | null, songs: Song[], isShuffle: boolean = false) {
        const list = isShuffle ? this.shuffleSongs(songs) : songs;
        this.musicId = id;
        this.playMusic(list[0], list);
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

    playNextSong(loop: boolean = false) {
        console.log(loop);
        if (!this.currentSong) return;
        let index = this.playList.indexOf(this.currentSong);
        if (index == this.playList.length - 1) index = -1;
        const song = this.playList[index + 1];
        this.playMusic(song);
    }
    playPrevSong(loop: boolean = false) {
        console.log(loop);
        if (!this.currentSong) return;
        let index = this.playList.indexOf(this.currentSong);
        if (index == 0) index = this.playList.length;
        const song = this.playList[index - 1];
        this.playMusic(song);
    }

    getAlbums() {
        return this.albums;
    }
    getMusic(id: string) {
        const item = this.musics.find(item => item.id == id) as Music;
        if (!item) return null;
        if (item.type == 'all') {
            const songIds = item.songIds.length ? item.songIds : this.songs.map(song => song.id);
            return { ...item, songIds }
        } else {
            return item;
        }
    }

    getArtist(id: string) {
        return this.artists.find(item => item.id === id);
    }
    getAlbum(id: string, withSongs: boolean = false) {
        const exist = this.albums.find(item => item.id === id);
        if (!exist) return;
        const album = { ...exist };
        if (withSongs) {
            album.artists = album.artistIds.map(id => this.getArtist(id) as Artist) || [];
            album.songs = this.songs.filter(s => s.albumId == album.id);;
        }
        return album;
    }
    getSong(id: string) {
        const exist = this.songs.find(item => item.id === id);
        if (!exist) return null;
        const song = { ...exist };
        song.album = this.getAlbum(song.albumId);
        song.artists = song.artistIds.map(aid => this.getArtist(aid)).filter(item => !!item);
        return song;
    }

    getSongs(ids: string[]) {
        return ids.map(id => this.getSong(id)).filter(item => !!item);
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