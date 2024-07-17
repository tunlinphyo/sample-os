export type ReactiveObject<T> = {
    [K in keyof T]: T[K];
};

export type WatcherCallback = () => void;

export class Dependency {
    private watchers: Set<WatcherCallback> = new Set();

    depend(callback: WatcherCallback) {
        // console.log('Adding a dependency', callback);
        if (callback) {
            this.watchers.add(callback);
        }
    }

    notify() {
        // console.log('Notifying watchers', this.watchers);
        this.watchers.forEach(callback => {
            // console.log('Executing watcher callback');
            callback();
        });
    }
}

export const dependencyMap = new WeakMap<object, Map<string | symbol, Dependency>>();

export function getDependency(target: object, key: string | symbol): Dependency {
    let depsMap = dependencyMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        dependencyMap.set(target, depsMap);
    }

    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Dependency();
        depsMap.set(key, dep);
    }

    return dep;
}

export function reactive<T extends object>(target: T): ReactiveObject<T> {
    return new Proxy(target, {
        get(target, key, receiver) {
            const dep = getDependency(target, key);
            dep.depend(() => {
                // console.log(`Getting value of ${String(key)}`);
            });
            return Reflect.get(target, key, receiver);
        },
        set(target, key, value, receiver) {
            const dep = getDependency(target, key);
            const result = Reflect.set(target, key, value, receiver);
            dep.notify();
            return result;
        }
    });
}

export function watch<T>(reactiveObj: ReactiveObject<T>, key: keyof T, callback: WatcherCallback) {
    // console.log(`Setting up a watcher for ${String(key)}`);
    const dep = getDependency(reactiveObj, key as string | symbol);
    dep.depend(callback);
}

// Example usage:

const state = reactive({
    count: 0,
    message: "Hello, World!"
});

// console.log('BEFORE WATCH');

watch(state, 'count', () => {
    // console.log(`Count changed to: ${state.count}`);
});

// watch(state, 'message', () => {
//     // console.log(`Message changed to: ${state.message}`);
// });

state.count = 1; // Should log: Notifying watchers, Count changed to: 1

// console.log('AFTER WATCH');