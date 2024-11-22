import { MusicService } from "../services/music.service";
import { AlbumStore } from "../stores/album.store";
import { ArtistStore } from "../stores/artist.store";
import { MusicStore, Music } from '../stores/music.store';
import { Song, SongStore } from "../stores/songs.store";
import { AudioController } from "./audio.controller";
import { BaseController } from "./base.controller"


export class MusicController extends BaseController {
    private audioId = 'music';
    private musics: Music[] = [];
    private service: MusicService;

    public currentSong: Song | null = null;
    public playList: Song[] = [];

    constructor(
        artistStore: ArtistStore,
        albumStore: AlbumStore,
        songStore: SongStore,
        public musicStore: MusicStore,
        public audio: AudioController
    ) {
        super();
        this.service = new MusicService(artistStore, albumStore, songStore);
        this.setupListeners();
    }

    private setupListeners() {
        this.musicStore.listen((musics) => {
            this.musics = musics;
        });
    }

    private addAudioListeners() {
        this.audio.on(this.audioId, 'play', () => {
            console.log('PLAYYYYYY')
            this.notifyListeners('SONG_PLAY_STATUS', 'play');
        });
        this.audio.on(this.audioId, 'pause', () => {
            console.log('PAUSEEEEE')
            this.notifyListeners('SONG_PLAY_STATUS', 'pause');
        });
        this.audio.on(this.audioId, 'stop', () => {
            console.log('stop')
            this.notifyListeners('SONG_PLAY_STATUS', 'stop');
        });
        this.audio.on(this.audioId, 'end', () => {
            console.log('end')
            this.notifyListeners('SONG_PLAY_STATUS', 'end');
        });

    }

    get player() {
        return this.musics.find(item => item.type === 'player');
    }
    get playing() {
        const data = this.musics.find(item => item.type === 'playing');
        if (!data) return [];
        return this.service.getSongs(data.data)
    }
    get latest() {
        return this.service.latestSongs;
    }
    get status() {
        return this.audio.getStatus(this.audioId);
    }
    get time() {
        return this.audio.getCurrentTime(this.audioId);
    }
    get duration() {
        return this.audio.getDuration(this.audioId);
    }

    playMusic(song: Song, songs: Song[]) {
        this.currentSong = song;
        this.playList = songs;
        this.audio.addAudio(this.audioId, song.id, song.music);
        this.audio.play(this.audioId);
        this.addAudioListeners();
        this.notifyListeners('SONG_CHANGE', this.currentSong);
    }

    play() {
        this.audio.seek(this.audioId, this.audio.getCurrentTime(this.audioId));
        this.audio.play(this.audioId);
    }
    pause() {
        this.audio.pause(this.audioId);
    }
}