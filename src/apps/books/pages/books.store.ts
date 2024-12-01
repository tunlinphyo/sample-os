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

        // const tempButton = this.createElement('button', []);
        // tempButton.textContent = 'OPEN_EBOOK';

        // this.addEventListener('click', () => {
        //     console.log('OPEN_EBOOK');
        //     this.history.pushState('/ebooks/reader', null);
        // }, tempButton);

        flexCenter.appendChild(message);
        this.mainArea.appendChild(flexCenter);

        // const epubUrl = '/books/When the Body Says No by Gabor MatÃ©.epub';
        // const epubUrl = '/books/James Clear - Atomic Habits_ Tiny Changes, Remarkable Results-Penguin Publishing Group (2018).epub';
        // const epubUrl = "/books/Robertson, Ian H - The winner effect_ the neuroscience of success and failure-Thomas Dunne Books_St. Martin's Press (2012_2013).epub";
        // const epubUrl = "/books/Charles Duhigg - The Power of Habit_ Why We Do What We Do in Life and Business-Random House (2012).epub";
        const epubUrl = "/books/Cal Newport - Deep Work_ Rules for Focused Success in a Distracted World-Grand Central Publishing (2016).epub";
        // const epubUrl = "/books/My Books Summary - 2024 - Tun Lin Phyo.epub";
        this.extractEpubFromUrl(epubUrl);

        // const bookData = EPUBParser.getData(this.mainArea.parentElement as HTMLElement, myData);
        // console.log(bookData);
    }

    update() {}

    public async extractEpubFromUrl(epubUrl: string) {
        const parser = new EPUBParser(epubUrl);
        parser.parse()
            .then((epubData) => {
                console.log(epubData);
                // const bookData = EPUBParser.getData(this.mainArea.parentElement as HTMLElement, epubData);
                // console.log(bookData);
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