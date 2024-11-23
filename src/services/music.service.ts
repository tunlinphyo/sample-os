import { Album, AlbumStore } from '../stores/album.store';
import { Artist, ArtistStore } from "../stores/artist.store";
import { Song, SongStore } from '../stores/songs.store';


export class MusicService {
    private artists: Artist[] = [];
    private albums: Album[] = [];
    private songs: Song[] = [];

    constructor(
        private artistStore: ArtistStore,
        private albumStore: AlbumStore,
        private songStore: SongStore
    ) {
        this.setupListeners();
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
    }

    get latestSongs() {
        return this.songs.map(song => this.getSong(song.id)).filter(item => !!item);
    }

    getAlbums() {
        return this.albums;
    }

    getArtist(id: string) {
        return this.artists.find(item => item.id === id);
    }
    getAlbum(id: string) {
        return this.albums.find(item => item.id === id);
    }
    getSong(id: string) {
        const song = this.songs.find(item => item.id === id);
        if (!song) return null;
        song.album = this.getAlbum(song.albumId)
        song.artists = song.artistIds.map(aid => this.getArtist(aid)).filter(item => !!item);
        return song;
    }

    getSongs(ids: string[]) {
        return ids.map(id => this.getSong(id)).filter(item => !!item);
    }
}