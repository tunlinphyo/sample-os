export class EpubUploader {
    private acceptedFileType: string = "application/epub+zip";
    private maxFileSize: number = 10 * 1024 * 1024;

    constructor(
        private inputElement: HTMLInputElement, 
        private onErrorCallback: (error: Error) => void,
        private onUploadCallback: (file: File) => void
    ) {
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

        const error = this.validateFile(file);

        if (error) {
            return this.onErrorCallback(error);
        }

        if (this.onUploadCallback) {
            this.onUploadCallback(file);
        }

        console.log("File uploaded successfully:", file.name);
    }

    private validateFile(file: File): Error | null {
        if (file.type !== this.acceptedFileType) {
            return new Error("Invalid file type. Please upload a .epub file.");
        }

        if (file.size > this.maxFileSize) {
            return new Error(`File size exceeds the limit of ${this.maxFileSize / 1024 / 1024}MB.`);
        }

        return null;
    }
}