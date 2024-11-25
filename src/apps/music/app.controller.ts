import { MusicController } from "../../controllers/music.controller";
import { DeviceController } from "../../device/device";
import { HistoryState, HistoryStateManager } from "../../device/history.manager";
import { AlbumPage } from "./pages/album.page";
import { AlbumsPage } from "./pages/albums.page";
import { ArtistPage } from "./pages/artist.page";
import { ArtistsPage } from "./pages/artists.page";
import { LibraryPage } from "./pages/library.page";
import { MusicPlayer } from "./pages/player.page";
import { PlaylistPage } from "./pages/playlist.page";
import { PlaylistsPage } from './pages/playlists.page';
import { QueuePage } from "./pages/queue.page";
import { SongsPage } from "./pages/songs.page";


export class MusicAppController {
    constructor(
        private history: HistoryStateManager,
        private device: DeviceController,
        private music: MusicController,
        private musicPlayer: MusicPlayer,
        private libraryPage: LibraryPage,
        private artistsPage: ArtistsPage,
        private artistPage: ArtistPage,
        private albumsPage: AlbumsPage,
        private albumPage: AlbumPage,
        private songsPage: SongsPage,
        private playlistsPage: PlaylistsPage,
        private playlistPage: PlaylistPage,
        private queuePage: QueuePage
    ) {
        this.renderListeners();
    }

    private renderListeners() {
        const handleChange = (state: any, url: string) => {
            this.history.handleChange(url, [
                {
                    pattern: '/player',
                    callback: () => {
                        this.musicPlayer.openPage('Player', state);
                    }
                },
                {
                    pattern: '/library',
                    callback: () => {
                        this.libraryPage.openPage('Library', this.music.libraryList);
                    }
                },
                {
                    pattern: '/artists',
                    callback: () => {
                        this.artistsPage.openPage('Artists', this.music.artistList);
                    }
                },
                {
                    pattern: '/artist',
                    callback: () => {
                        const artist = this.music.getArtist(state);
                        this.artistPage.openPage('Artist', artist);
                    }
                },
                {
                    pattern: '/albums',
                    callback: () => {
                        this.albumsPage.openPage('Albums', this.music.albumList);
                    }
                },
                {
                    pattern: '/albums/detail',
                    callback: () => {
                        const album = this.music.getAlbum(state, true);
                        this.albumPage.openPage('Album', album);
                    }
                },
                {
                    pattern: '/playlists',
                    callback: () => {
                        this.playlistsPage.openPage('Playlists', this.music.playlist);
                    }
                },
                {
                    pattern: '/playlist',
                    callback: () => {
                        const playlist = this.music.getMusic(state);
                        this.playlistPage.openPage('Playlist', playlist);
                    }
                },
                {
                    pattern: '/songs',
                    callback: () => {
                        const music = this.music.getMusicSongs(state);
                        this.songsPage.openPage('Songs', music);
                    }
                },
                {
                    pattern: '/queue',
                    callback: () => {
                        this.queuePage.openPage('Queue', this.music.queue);
                    }
                },
            ]);
        }

        const errorAlert = (status: string, message: string) => {
            if (status === 'ERROR') {
                this.device.alertPopup.openPage('Error', message);
            }
        }

        this.history.onStateChange(handleChange);
        this.music.addChangeListener(errorAlert);

        this.device.addEventListener('openAppFinished', () => {
            const history = parent.device.getHistory('music');
            if (!history) return;
            this.history.init(history);
            history.forEach((item: HistoryState) => {
                handleChange(item.state, item.url);
            })
        })

        this.device.addEventListener('closeApp', () => {
            this.music.removeChangeListener(errorAlert);
            this.device.setHistory('music', this.history.history);
        });
    }
}