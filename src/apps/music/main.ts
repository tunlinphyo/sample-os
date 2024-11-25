import '../../style.css';
import './music.css';

import { HistoryStateManager } from '../../device/history.manager';
import { MusicApp } from './pages/app.page';
import { MusicAppController } from './app.controller';
import { MusicPlayer } from './pages/player.page';
import { AlbumsPage } from './pages/albums.page';
import { AlbumPage } from './pages/album.page';
import { PlaylistPage } from './pages/playlist.page';
import { LibraryPage } from './pages/library.page';
import { ArtistsPage } from './pages/artists.page';
import { PlaylistsPage } from './pages/playlists.page';
import { QueuePage } from './pages/queue.page';
import { ArtistPage } from './pages/artist.page';
import { SongsPage } from './pages/songs.page';

document.body.dataset.schema = parent.device.theme;

document.addEventListener('DOMContentLoaded', () => {
    const historyManager = new HistoryStateManager();

    new MusicApp(historyManager, parent.device, parent.music);
    const musicPlayer = new MusicPlayer(historyManager, parent.device, parent.music);
    const libraryPage = new LibraryPage(historyManager);
    const artistsList = new ArtistsPage(historyManager);
    const artistPage = new ArtistPage(historyManager, parent.music);
    const albumsPage = new AlbumsPage(historyManager);
    const albumPage = new AlbumPage(historyManager, parent.device, parent.music);
    const songsPage = new SongsPage(historyManager, parent.device, parent.music);
    const playListsPage = new PlaylistsPage(historyManager, parent.device, parent.music);
    const playlistPage = new PlaylistPage(historyManager, parent.device, parent.music);
    const queuePage = new QueuePage(historyManager, parent.device, parent.music);

    new MusicAppController(
        historyManager,
        parent.device,
        parent.music,
        musicPlayer,
        libraryPage,
        artistsList,
        artistPage,
        albumsPage,
        albumPage,
        songsPage,
        playListsPage,
        playlistPage,
        queuePage
    );
});