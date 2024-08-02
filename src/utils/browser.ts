

export class OSBrowser {
    public static isTouchSupport() {
        return 'ontouchstart' in window || navigator.maxTouchPoints;
    }

    public static getPreferredColorScheme(): 'light' | 'dark' {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        } else {
            return 'light';
        }
    }
}