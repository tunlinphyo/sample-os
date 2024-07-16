export interface AppStateManager {
    pattern: string;
    callback: () => void;
}

export interface HistoryState {
    url: string;
    state: any;
}

export class HistoryStateManager {
    private stateChangeListeners: Array<(state: any, url: string) => void> = [];
    private states: HistoryState[] = [];

    constructor() {
        window.addEventListener('popstate', this.onPopState.bind(this));
    }

    get history(): HistoryState[]  {
        return this.states;
    }

    set history(state: HistoryState) {
        this.states.push(state);
    }

    set replaceHistory(state: HistoryState) {
        const is = this.states.find(item => item.url === state.url);
        if (is) this.states = this.states.map(item => item.url === state.url ? state : item);
        else this.states.push(state);
    }

    init(states: HistoryState[]) {
        this.states = states;
        console.log('ON_HISTORY_INIT', this.states);
    }

    public pushState(url: string, state: any, title: string = '') {
        try {
            this.history = { state, url };
            history.pushState(state, title, url);
            this.notifyStateChange(state, url);
        } catch (error) {
            console.error('Error in pushState:', error);
        }
    }

    public replaceState(url: string, state: any, title: string = '') {
        try {
            this.replaceHistory = { state, url };
            history.replaceState(state, title, url);
            this.notifyStateChange(state, url);
        } catch (error) {
            console.error('Error in replaceState:', error);
        }
    }

    public goBack() {
        if (this.states.length) {
            this.states.pop();
            console.log('ON_HISTORY_POP', this.history);
        }
    }

    public updateState(url: string, state: any) {
        this.states = this.states.map(item => item.url === url ? { ...item, state } : item);
    }

    public onStateChange(listener: (state: any, url: string) => void) {
        this.stateChangeListeners.push(listener);
    }

    public handleChange(url: string, list: AppStateManager[]) {
        const data = list.find(item => item.pattern === url);
        if (data) {
            data.callback();
        }
    }

    private notifyStateChange(state: any, url: string) {
        for (const listener of this.stateChangeListeners) {
            listener(state, url);
        }
    }

    private onPopState(event: PopStateEvent) {
        this.goBack();
        console.log('POPSTATE_EVENT:::::::::::::::', event.state);
    }
}