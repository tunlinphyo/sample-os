// Ensure you have JSZip installed:
// npm install jszip

import JSZip from 'jszip';

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
}