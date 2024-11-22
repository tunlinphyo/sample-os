import '../../style.css';
import './music.css';

import { HistoryStateManager } from '../../device/history.manager';
import { MusicApp } from './pages/app.page';
import { MusicAppController } from './app.controller';
import { MusicPlayer } from './pages/player.page';

document.body.dataset.schema = parent.device.theme;

document.addEventListener('DOMContentLoaded', () => {
    const historyManager = new HistoryStateManager();

    new MusicApp(historyManager, parent.device, parent.music);
    const musicPlayer = new MusicPlayer(historyManager, parent.device, parent.music);

    new MusicAppController(
        historyManager,
        parent.device,
        parent.music,
        musicPlayer
    );
});