import { Page } from "../../../components/page";
import { HistoryStateManager } from "../../../device/history.manager";
import { EPUBParser } from "../../../services/epub.servide";


export class BookStorePage extends Page {
    // private extractor: EpubExtractor;

    constructor(
        history: HistoryStateManager,
    ) {
        super(history, {});
        // this.extractor = new EpubExtractor();
    }

    render() {
        const flexCenter = this.createFlexCenter();

        const message = this.createElement('div', ['message']);
        message.textContent = 'Coming soon..';

        flexCenter.appendChild(message);
        this.mainArea.appendChild(flexCenter);

        const epubUrl = '/books/When the Body Says No by Gabor MatÃ©.epub';
        this.extractEpubFromUrl(epubUrl);
    }

    update() {}

    private async extractEpubFromUrl(epubUrl: string) {
        const parser = new EPUBParser(epubUrl);
        parser.parse()
            .then((epubData) => {
                console.log(epubData);
                // Access contents as an array
                // epubData.contents.forEach((content: { id: string; text: string }, index: number) => {
                //     console.log(`Content ${index + 1} (ID: ${content.id}):`, content.text);
                // });
            })
            .catch((error) => {
                console.error('Error parsing EPUB file:', error);
            });
    }

}