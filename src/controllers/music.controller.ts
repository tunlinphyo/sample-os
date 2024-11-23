// import { MusicService } from "../services/music.service";
import { Album, AlbumStore } from "../stores/album.store";
import { Artist, ArtistStore } from "../stores/artist.store";
import { MusicStore, Music } from '../stores/music.store';
import { Song, SongStore } from "../stores/songs.store";
import { OSAudio } from "../utils/audio";
import { AudioController } from "./audio.controller";
import { BaseController } from "./base.controller"


export class MusicController extends BaseController {
    private audioId = 'music';

    private artists: Artist[] = [];
    private albums: Album[] = [];
    private songs: Song[] = [];
    private musics: Music[] = [];

    // private service: MusicService;

    public currentSong: Song | null = null;
    public playList: Song[] = [];

    public audio: OSAudio;

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

        this.artistStore.listen((artists) => {
            this.artists = artists;
        });

        this.albumStore.listen((albums) => {
            this.albums = albums;
        });

        this.songStore.listen((songs) => {
            this.songs = songs;
        });
    }

    get player() {
        return this.musics.find(item => item.type === 'player');
    }
    get playing() {
        const data = this.musics.find(item => item.type === 'playing');
        if (!data) return [];
        return this.getSongs(data.data)
    }
    get latest() {
        return this.songs.map(song => this.getSong(song.id)).filter(item => !!item);
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
            .map(album => ({
                ...album,
                artists: album.artistIds.map(id => this.getArtist(id))
            }));
    }

    playMusic(song: Song, songs?: Song[]) {
        this.currentSong = song;
        if (songs) this.playList = songs;

        this.audio.playSong(song.music, 0);
        this.notifyListeners('SONG_CHANGE', this.currentSong);
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

    getArtist(id: string) {
        return this.artists.find(item => item.id === id);
    }
    getAlbum(id: string, withSongs: boolean = false) {
        const exist = this.albums.find(item => item.id === id);
        if (!exist) return;
        const album = { ...exist };
        if (withSongs) {
            album.artists = album.artistIds.map(id => this.getArtist(id) as Artist) || [];
            album.songs = this.songs.filter(s => s.albumId == album.id);
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
}