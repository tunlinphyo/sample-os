import { BaseController } from "./base.controller";

interface FullscreenElement extends HTMLElement {
    webkitRequestFullscreen?: () => Promise<void>;
    mozRequestFullScreen?: () => Promise<void>;
    msRequestFullscreen?: () => Promise<void>;
}

interface FullscreenDocument extends Document {
    webkitExitFullscreen?: () => Promise<void>;
    mozCancelFullScreen?: () => Promise<void>;
    msExitFullscreen?: () => Promise<void>;
    webkitFullscreenElement?: Element;
    mozFullScreenElement?: Element;
    msFullscreenElement?: Element;
}

export class FullscreenController extends BaseController {
    constructor() {
        super();
    }

    openFullscreen(elem: FullscreenElement) {
        if (!elem) return;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) { /* Firefox */
            elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
            elem.msRequestFullscreen();
        }
    }

    closeFullscreen() {
        const doc = document as FullscreenDocument;
        if (doc.exitFullscreen) {
            doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) { /* Safari */
            doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) { /* Firefox */
            doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) { /* IE11 */
            doc.msExitFullscreen();
        }
    }

    isFullScreenMode() {
        const doc = document as FullscreenDocument;
        return !!doc.fullscreenElement ||
               !!doc.webkitFullscreenElement ||
               !!doc.mozFullScreenElement ||
               !!doc.msFullscreenElement;
    }
}