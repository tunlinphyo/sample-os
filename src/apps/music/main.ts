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

document.body.dataset.schema = parent.device.theme;

document.addEventListener('DOMContentLoaded', () => {
    const historyManager = new HistoryStateManager();

    new MusicApp(historyManager, parent.device, parent.music);
    const musicPlayer = new MusicPlayer(historyManager, parent.device, parent.music);
    const libraryPage = new LibraryPage(historyManager, parent.device, parent.music);
    const albumsPage = new AlbumsPage(historyManager, parent.device, parent.music);
    const albumPage = new AlbumPage(historyManager, parent.device, parent.music);
    const playlistPage = new PlaylistPage(historyManager, parent.device, parent.music);

    new MusicAppController(
        historyManager,
        parent.device,
        parent.music,
        musicPlayer,
        libraryPage,
        albumsPage,
        albumPage,
        playlistPage
    );
});