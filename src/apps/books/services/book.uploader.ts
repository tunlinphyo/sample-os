export class EpubUploader {
    private acceptedFileType: string = "application/epub+zip";
    private maxFileSize: number = 2 * 1024 * 1024;

    constructor(private inputElement: HTMLInputElement, private onUploadCallback?: (file: File) => void) {
        this.init();
    }

    private init(): void {
        this.inputElement.addEventListener("change", (event) => this.handleFileSelect(event));
    }

    private handleFileSelect(event: Event): void {
        const inputElement = event.target as HTMLInputElement;

        if (!inputElement.files || inputElement.files.length === 0) {
            console.error("No file selected.");
            return;
        }

        const file = inputElement.files[0];

        if (!this.validateFile(file)) {
            return;
        }

        if (this.onUploadCallback) {
            this.onUploadCallback(file);
        }

        console.log("File uploaded successfully:", file.name);
    }

    private validateFile(file: File): boolean {
        if (file.type !== this.acceptedFileType) {
            console.error("Invalid file type. Please upload a .epub file.");
            return false;
        }

        if (file.size > this.maxFileSize) {
            console.error(`File size exceeds the limit of ${this.maxFileSize / 1024 / 1024}MB.`);
            return false;
        }

        return true;
    }
}