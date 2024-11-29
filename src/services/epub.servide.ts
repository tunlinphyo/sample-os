// Ensure you have JSZip installed:
// npm install jszip

import JSZip from 'jszip';
import { Book, Chapter } from '../stores/books.store';
import { v4 as uuidv4 } from 'uuid';
import { OSString } from '../utils/string';
import { EbookRender } from './ebook.render';

interface NodeRepresentation {
    type: 'element' | 'text';
    tagName?: string;
    attributes?: { [key: string]: string };
    content?: string;
    children?: NodeRepresentation[];
}

export class EPUBParser {
    private url: string;

    constructor(url: string) {
        this.url = url;
    }

    /**
     * Fetches and parses the EPUB file from the given URL and extracts its data as JSON,
     * including the contents as an array.
     * @returns A Promise that resolves to the extracted data in JSON format.
     */
    public async parse(): Promise<any> {
        // Fetch the EPUB file as an ArrayBuffer
        const arrayBuffer = await this.fetchFileAsArrayBuffer(this.url);

        // Load the EPUB file using JSZip
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
     * Fetches a file from the given URL as an ArrayBuffer.
     * @param url - The URL of the file to fetch.
     * @returns A Promise that resolves to the file's ArrayBuffer.
     */
    private async fetchFileAsArrayBuffer(url: string): Promise<ArrayBuffer> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch the file. Status: ${response.status}`);
        }
        return await response.arrayBuffer();
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
                        const bodyContent = this.extractBodyInnerHTML(contentFileContent);
                        console.log('contentFileContent', bodyContent);
                        const text = this.extractTextFromContentFile(contentFileContent);
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

        const contents = epubData.contents.filter((item: any) => !removeIDs.includes(item.id) && !item.id.includes('_fn')) as any[];
        const render = new EbookRender(parentEl, contents);
        const { list, total } = render.getContents();

        const chapters = epubData.spine
            .filter((item: any) => !removeIDs.includes(item.idref) && !item.idref.includes('_fn'))
            .map((item: {idref:string}) => {
                const content = list.find(c => c.id == item.idref)
                return {
                    idref: item.idref,
                    title: "Chapter " + OSString.getBookTitle(item.idref),
                    pageNumber: content?.startPage || 1,
                }
            })  as Chapter[];


        return {
            id: uuidv4(),
            title: epubData.metadata.title,
            author: epubData.metadata.creator,
            chapters: chapters,
            totalPages: total,
            bookmarks: [],
            currantPage: 1,
            contents: list
        }
    }

    extractBodyInnerHTML(htmlContent: string): string {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const body = doc.body;
        if (!body) {
            throw new Error('No <body> tag found in the HTML content.');
        }
        return body.innerHTML.trim();
    }

    extractBodyContent(htmlContent: string): NodeRepresentation[] {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const body = doc.body;
        if (!body) {
            throw new Error('No <body> tag found in the HTML content.');
        }

        function nodeToJSON(node: Node): NodeRepresentation {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                const nodeRep: NodeRepresentation = {
                    type: 'element',
                    tagName: element.tagName.toLowerCase(),
                    attributes: {},
                    children: [],
                };

                // Extract attributes
                for (let i = 0; i < element.attributes.length; i++) {
                    const attr = element.attributes.item(i);
                    if (attr) {
                        nodeRep.attributes![attr.name] = attr.value;
                    }
                }

                // Process child nodes recursively
                element.childNodes.forEach((child) => {
                    nodeRep.children!.push(nodeToJSON(child));
                });

                return nodeRep;
            } else if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent?.trim();
                if (text) {
                    return {
                        type: 'text',
                        content: text,
                    };
                } else {
                    // Ignore empty text nodes
                    return null as any;
                }
            } else {
                // Ignore other node types (comments, processing instructions, etc.)
                return null as any;
            }
        }

        const result: NodeRepresentation[] = [];
        body.childNodes.forEach((child) => {
            const nodeRep = nodeToJSON(child);
            if (nodeRep) {
                result.push(nodeRep);
            }
        });

        return result;
    }
}