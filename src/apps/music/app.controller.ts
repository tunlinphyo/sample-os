import { MusicController } from "../../controllers/music.controller";
import { DeviceController } from "../../device/device";
import { HistoryState, HistoryStateManager } from "../../device/history.manager";
import { AlbumPage } from "./pages/album.page";
import { AlbumsPage } from "./pages/albums.page";
import { MusicPlayer } from "./pages/player.page";


export class MusicAppController {
    constructor(
        private history: HistoryStateManager,
        private device: DeviceController,
        private music: MusicController,
        private musicPlayer: MusicPlayer,
        private albumsPage: AlbumsPage,
        private albumPage: AlbumPage
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