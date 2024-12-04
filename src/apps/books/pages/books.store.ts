import { Page } from "../../../components/page";
import { DeviceController } from "../../../device/device";
import { HistoryStateManager } from "../../../device/history.manager";
import { EPUBParser } from "../../../services/ebook.parser";
import { EpubUploader } from "../services/book.uploader";
import { BooksController } from "../books.controller";

export class BookStorePage extends Page {
    private uploadEl: HTMLInputElement;

    constructor(
        history: HistoryStateManager,
        private book: BooksController,
        private device: DeviceController
    ) {
        super(history, { btnEnd: 'add' });
        this.uploadEl = this.createElement<HTMLInputElement>('input', [], {
            type: 'file',
            accept: '.epub'
        });
        this.init();
    }

    private init() {
        new EpubUploader(
            this.uploadEl,
            (error: Error) => {
                this.device.alertPopup.openPage('Error', error.message);
            },
            (file: File) => {
                this.extractEpubFromUrl(file);
            }
        );

        this.addEventListener('click', () => {
            this.uploadEl.click();
        }, this.btnEnd, false);
    }

    render() {
        const flexCenter = this.createFlexCenter();

        const message = this.createElement('div', ['message']);
        message.textContent = 'Coming soon..';

        flexCenter.appendChild(message);
        this.mainArea.appendChild(flexCenter);
    }

    update() {}

    public async extractEpubFromUrl(file: File) {
        const [ close, update ] = await this.device.loadingPopup.openPage('Loading', 'Uploading...');
        const parser = new EPUBParser(file);
        const epubData = await parser.parse().catch((error: Error) => {
            close();
            this.device.alertPopup.openPage('Error', error.message);
        });

        await update('Processiong...');
        console.log(epubData);
        console.log(this.mainArea.parentElement);
        const bookData = EPUBParser.getData(this.mainArea.parentElement as HTMLElement, epubData);
        await update('Saving...');
        console.log(bookData);
        await this.book.addBook(bookData);
        close();
    }

}