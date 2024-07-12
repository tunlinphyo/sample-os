export class IndexedDBUsage {
    constructor() {
        if (!('indexedDB' in window)) {
            console.error("This browser doesn't support IndexedDB");
        }
    }

    public isSupport() {
        return ('storage' in navigator && 'estimate' in navigator.storage)
    }

    public async getStorage() {
        try {
            const estimate = await navigator.storage.estimate();
            const quota = estimate.quota;
            const usage = estimate.usage;

            return { quota: quota || 0, usage: usage || 0 };
        } catch (error) {
            console.error('Error getting IndexedDB usage:', error);
        }
    }

    public async getUsage(): Promise<void> {
        try {
            const databases = await indexedDB.databases();

            for (const dbInfo of databases) {
                const dbName = dbInfo.name;
                const dbVersion = dbInfo.version;

                const request = indexedDB.open(dbName as string, dbVersion);
                request.onsuccess = (event) => {
                    const db = (event.target as IDBOpenDBRequest).result;
                    this.getDatabaseUsage(db);
                };
            }
        } catch (error) {
            console.error('Error getting IndexedDB usage:', error);
        }
    }

    private async getDatabaseUsage(db: IDBDatabase): Promise<void> {
        for (const storeName of db.objectStoreNames) {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);

            const request = store.getAll();
            request.onsuccess = (event) => {
                const allRecords = (event.target as IDBRequest).result;
                let totalSize = 0;

                for (const record of allRecords) {
                    totalSize += JSON.stringify(record).length;
                }

                console.log(`Database: ${db.name}, Object Store: ${storeName}, Size: ${totalSize} bytes`);
            };

            request.onerror = (event) => {
                console.error(`Error reading object store ${storeName} in database ${db.name}:`, event);
            };
        }
    }

    private getDBUsage(request: IDBOpenDBRequest): Promise<number> {
        return new Promise((resolve) => {
            let totalSize = 0;
            request.onsuccess = async (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                for (const storeName of db.objectStoreNames) {

                    const transaction = db.transaction(storeName, 'readonly');
                    const store = transaction.objectStore(storeName);

                    const request = store.getAll();
                    totalSize += await this.getSizeBites(request);
                }
                resolve(totalSize);
            };
        })
    }

    private getSizeBites(request: IDBRequest<any[]>): Promise<number> {
        return new Promise((resolve) => {
            request.onsuccess = (event) => {
                const allRecords = (event.target as IDBRequest).result;
                let totalSize = 0;
                for (const record of allRecords) {
                    totalSize += JSON.stringify(record).length;
                }
                resolve(totalSize);
            };

            request.onerror = () => {
                resolve(0);
            };
        });
    }

    public async getStoreUsage(dbNames: string[]) {
        const databases = await indexedDB.databases();
        let totalSize = 0;

        for (const dbInfo of databases) {
            const dbName = dbInfo.name;
            const dbVersion = dbInfo.version;

            if (dbNames.includes(dbName as string)) {
                const request = indexedDB.open(dbName as string, dbVersion);
                totalSize = await this.getDBUsage(request);
            }
        }
        return totalSize;
    }

    public async clearStore(dbName: string, storeName: string): Promise<void> {
        try {
            const request = indexedDB.open(dbName);
            request.onsuccess = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                const clearRequest = store.clear();

                clearRequest.onsuccess = () => {
                    console.log(`Object store '${storeName}' in database '${dbName}' has been cleared.`);
                };

                clearRequest.onerror = (event) => {
                    console.error(`Error clearing object store '${storeName}' in database '${dbName}':`, event);
                };
            };

            request.onerror = (event) => {
                console.error(`Error opening database '${dbName}':`, event);
            };
        } catch (error) {
            console.error('Error clearing IndexedDB store:', error);
        }
    }

    public static bytesToGB(bytes: number, fixed: number = 2): string {
        const bytesInGB = 1024 ** 3;
        return (bytes / bytesInGB).toFixed(fixed);
    }

    public static bytesToMB(bytes: number, fixed: number = 2): string {
        const bytesInGB = 1024 ** 2;
        return (bytes / bytesInGB).toFixed(fixed);
    }
}