

export class OSBrowser {
    public static isTouchSupport() {
        return 'ontouchstart' in window || navigator.maxTouchPoints;
    }
}