export class ImageProcessor {
    private img: HTMLImageElement;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private targetWidth: number;
    private targetHeight?: number;

    constructor(sourceImage: string, canvas: HTMLCanvasElement, targetWidth: number) {
        this.img = new Image();
        this.img.src = sourceImage;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d')!;
        this.targetWidth = targetWidth;

        // Handle the image load event
        this.img.onload = () => {
            this.initialize();
            this.processImage();
        };
    }

    private initialize() {
        const aspectRatio = this.img.width / this.img.height;
        this.targetHeight = this.targetWidth / aspectRatio;

        // Set canvas size to the desired dimensions
        this.canvas.width = this.targetWidth;
        this.canvas.height = this.targetHeight;

        // Draw the image onto the canvas with resizing
        this.ctx.drawImage(this.img, 0, 0, this.targetWidth, this.targetHeight);
    }

    private toGrayscale(r: number, g: number, b: number): number {
        return 0.299 * r + 0.587 * g + 0.114 * b;
    }

    private findClosestBW(value: number): number {
        return value < 128 ? 0 : 255;
    }

    private distributeError(data: Uint8ClampedArray, index: number, error: number, factor: number) {
        data[index] = Math.min(255, Math.max(0, data[index] + error * factor));
    }

    private processImage() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;

        // Floyd-Steinberg dithering algorithm for black and white
        for (let y = 0; y < this.canvas.height; y++) {
            for (let x = 0; x < this.canvas.width; x++) {
                const index = (y * this.canvas.width + x) * 4;
                const oldGray = this.toGrayscale(data[index], data[index + 1], data[index + 2]);
                const newGray = this.findClosestBW(oldGray);

                const error = oldGray - newGray;

                data[index] = newGray; // Set new grayscale value to red channel
                data[index + 1] = newGray; // Set new grayscale value to green channel
                data[index + 2] = newGray; // Set new grayscale value to blue channel

                // Distribute error to neighboring pixels
                if (x + 1 < this.canvas.width) {
                    this.distributeError(data, index + 4, error, 7 / 16);
                }
                if (x > 0 && y + 1 < this.canvas.height) {
                    this.distributeError(data, index + (this.canvas.width - 1) * 4, error, 3 / 16);
                }
                if (y + 1 < this.canvas.height) {
                    this.distributeError(data, index + this.canvas.width * 4, error, 5 / 16);
                }
                if (x + 1 < this.canvas.width && y + 1 < this.canvas.height) {
                    this.distributeError(data, index + (this.canvas.width + 1) * 4, error, 1 / 16);
                }
            }
        }

        // Put the modified data back to the canvas
        this.ctx.putImageData(imageData, 0, 0);
    }
}