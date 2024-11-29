import JSZip from 'jszip';
import { Book, Chapter, Content } from '../stores/books.store';
import { v4 as uuidv4 } from 'uuid';
import { OSString } from '../utils/string';
import { EbookRender } from './ebook.render';

export class EPUBParser {
    private file: File;

    constructor(file: File) {
        this.file = file;
    }

    public async parse(): Promise<any> {
        const arrayBuffer = await this.readFileAsArrayBuffer(this.file);

        const zip = await JSZip.loadAsync(arrayBuffer);

        // Locate and read the container.xml file
        const containerXmlContent = await zip.file('META-INF/container.xml')?.async('text');
        if (!containerXmlContent) {
            throw new Error('Invalid EPUB file: container.xml is missing.');
        }

        // Parse container.xml to find the path to the OPF file
        const opfFilePath = this.getOpfFilePath(containerXmlContent);
        if (!opfFilePath) {
            throw new Error('Invalid EPUB file: OPF file path not found.');
        }

        // Read and parse the OPF file
        const opfFileContent = await zip.file(opfFilePath)?.async('text');
        if (!opfFileContent) {
            throw new Error('Invalid EPUB file: OPF file is missing.');
        }

        // Extract data from the OPF file
        const extractedData = await this.extractDataFromOpf(opfFileContent, zip, opfFilePath);

        return extractedData;
    }

    /**
     * Reads a File as an ArrayBuffer.
     * @param file - The File to read.
     * @returns A Promise that resolves to the file's ArrayBuffer.
     */
    private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target?.result as ArrayBuffer);
            reader.onerror = () => reject(new Error('Failed to read the file.'));
            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * Parses container.xml to find the OPF file path.
     * @param containerXmlContent - The content of container.xml.
     * @returns The OPF file path.
     */
    private getOpfFilePath(containerXmlContent: string): string {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(containerXmlContent, 'application/xml');
        const rootfileElement = xmlDoc.querySelector('rootfile');
        return rootfileElement?.getAttribute('full-path') || '';
    }

    /**
     * Extracts data from the OPF file, including contents.
     * @param opfFileContent - The content of the OPF file.
     * @param zip - The JSZip instance containing the EPUB files.
     * @param opfFilePath - The path to the OPF file within the EPUB.
     * @returns An object containing metadata, manifest, spine, and contents.
     */
    private async extractDataFromOpf(opfFileContent: string, zip: JSZip, opfFilePath: string): Promise<any> {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(opfFileContent, 'application/xml');

        // Extract metadata
        const metadataElement = xmlDoc.querySelector('metadata');
        const metadata: Record<string, string> = {};
        if (metadataElement) {
            metadata['title'] = metadataElement.querySelector('title')?.textContent || '';
            metadata['creator'] = metadataElement.querySelector('creator')?.textContent || '';
            metadata['language'] = metadataElement.querySelector('language')?.textContent || '';
            // Add more metadata fields as needed
        }

        // Extract manifest
        const manifestItems = xmlDoc.querySelectorAll('manifest > item');
        const manifest: Record<string, any> = {};
        manifestItems.forEach((item) => {
            const id = item.getAttribute('id') || '';
            manifest[id] = {
                href: item.getAttribute('href') || '',
                mediaType: item.getAttribute('media-type') || '',
            };
        });

        // Extract spine
        const spineItems = xmlDoc.querySelectorAll('spine > itemref');
        const spine: Array<Record<string, string>> = [];
        spineItems.forEach((itemref) => {
            spine.push({
                idref: itemref.getAttribute('idref') || '',
            });
        });

        // Extract contents
        const contents: Array<{ id: string; text: string }> = [];
        const opfDir = this.getDirectoryPath(opfFilePath);

        // Iterate over the spine items to extract content in order
        for (const spineItem of spine) {
            const idref = spineItem.idref;
            const manifestItem = manifest[idref];
            if (manifestItem) {
                const href = manifestItem.href;
                const mediaType = manifestItem.mediaType;
                if (mediaType === 'application/xhtml+xml' || mediaType === 'text/html' || mediaType === 'application/xml') {
                    // Construct the full path to the content file
                    const contentFilePath = opfDir + href;
                    const contentFile = zip.file(contentFilePath);
                    if (contentFile) {
                        const contentFileContent = await contentFile.async('text');
                        // const text = this.extractTextFromContentFile(contentFileContent);
                        console.log(contentFileContent);
                        const text = this.extractBodyInnerHTML(contentFileContent)
                        contents.push({
                            id: idref,
                            text: text,
                        });
                    } else {
                        console.warn(`Content file not found in ZIP: ${contentFilePath}`);
                    }
                }
            }
        }

        return {
            metadata,
            manifest,
            spine,
            contents,
        };
    }

    /**
     * Extracts text content from an XHTML or HTML file content.
     * @param contentFileContent - The content of the XHTML/HTML file.
     * @returns The extracted text content.
     */
    private extractTextFromContentFile(contentFileContent: string): string {
        const parser = new DOMParser();
        const doc = parser.parseFromString(contentFileContent, 'application/xhtml+xml');
        // Handle parsing errors
        const parserError = doc.querySelector('parsererror');
        if (parserError) {
            console.warn('Error parsing content file:', parserError.textContent);
            return '';
        }
        // Extract text content
        return doc.body?.textContent?.trim() || '';
    }

    /**
     * Gets the directory path from a file path.
     * @param filePath - The full file path.
     * @returns The directory path.
     */
    private getDirectoryPath(filePath: string): string {
        const lastSlashIndex = filePath.lastIndexOf('/');
        if (lastSlashIndex !== -1) {
            return filePath.substring(0, lastSlashIndex + 1);
        }
        return '';
    }

    public static getData(parentEl: HTMLElement, epubData: any): Book {
        const removeIDs: string[] = [];

        const getBookTitle = (id: string, contents: Content[]) => {
            const content = [...contents].find(item => item.id == id);
            if (!(content && content.pages[0])) return;
            const first = content.pages[0].split(' <br><br> ');
            const title = first[0];
            if (title && title.length > 30) return '';
            return title;
        }

        const contents = epubData.contents.filter((item: any) => !removeIDs.includes(item.id) && !item.id.includes('_fn')) as any[];
        const render = new EbookRender(parentEl, contents);
        const { list, total } = render.getContents();

        const chapters = epubData.spine
            .filter((item: any) => !removeIDs.includes(item.idref))
            .map((item: { idref: string }) => {
                const content = list.find(c => c.id == item.idref);
                return {
                    idref: item.idref,
                    title: OSString.getBookTitle(item.idref),
                    pageNumber: content?.startPage || 1,
                };
            })
            .filter((item: any) => !!item.title) as Chapter[];

        return {
            id: uuidv4(),
            title: epubData.metadata.title,
            author: epubData.metadata.creator,
            chapters: chapters,
            totalPages: total,
            bookmarks: [],
            currantPage: 1,
            contents: list,
            lastReadDate: new Date(),
        };
    }

    extractBodyInnerHTML(xhtmlContent: string): string {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xhtmlContent, 'application/xhtml+xml');

        // Check for parsing errors
        const parserError = doc.getElementsByTagName('parsererror');
        if (parserError.length > 0) {
            throw new Error('Error parsing the XHTML content.');
        }

        // Define the XHTML namespace
        const XHTML_NS = 'http://www.w3.org/1999/xhtml';

        // Access the <body> element using namespace-aware methods
        const body = doc.getElementsByTagNameNS(XHTML_NS, 'body')[0];
        if (!body) {
            throw new Error('No <body> tag found in the XHTML content.');
        }

        // Return the inner HTML of the <body> element
        return body.innerHTML.trim();
    }

}