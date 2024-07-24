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

    constructor() {}

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
    }

    public pushState(url: string, state: any) {
        try {
            this.history = { state, url };
            this.notifyStateChange(state, url);
        } catch (error) {
            console.error('Error in pushState:', error);
        }
    }

    public replaceState(url: string, state: any) {
        try {
            this.replaceHistory = { state, url };
            this.notifyStateChange(state, url);
        } catch (error) {
            console.error('Error in replaceState:', error);
        }
    }

    public goBack() {
        if (this.states.length) {
            this.states.pop();
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
}