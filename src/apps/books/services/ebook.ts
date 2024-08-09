type Chapter = {
    index: number;
    title: string;
    contant: string;
};

class Ebook {
    private id: string;
    private title: string;
    private author: string;
    private chapters: Chapter[];
    private viewWidth: number;
    private viewHeight: number;
    private fontSize: number;

    constructor(id: string, title: string, author: string, chapters: Chapter[], viewWidth: number, viewHeight: number, fontSize: number) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.chapters = chapters;
        this.viewWidth = viewWidth;
        this.viewHeight = viewHeight;
        this.fontSize = fontSize;
    }

    paginateChapters(): { chapterIndex: number, pages: string[] }[] {
        return this.chapters.map(chapter => ({
            chapterIndex: chapter.index,
            pages: this.paginateText(chapter.contant)
        }));
    }

    private paginateText(text: string): string[] {
        const words = text.split(/\s+/).filter(word => word.length > 0);
        const wordsPerLine = this.calculateWordsPerLine();
        const linesPerPage = this.calculateLinesPerPage();
        const wordsPerPage = wordsPerLine * linesPerPage;

        const pages: string[] = [];
        let currentPage: string[] = [];

        for (const word of words) {
            if (currentPage.length >= wordsPerPage) {
                pages.push(currentPage.join(' '));
                currentPage = [];
            }
            currentPage.push(word);
        }

        if (currentPage.length > 0) {
            pages.push(currentPage.join(' '));
        }

        return pages;
    }

    private calculateWordsPerLine(): number {
        const averageWordLength = 5; // Average word length in characters
        const characterWidth = this.fontSize * 0.6; // Average character width factor
        return Math.floor(this.viewWidth / (characterWidth * averageWordLength));
    }

    private calculateLinesPerPage(): number {
        const lineHeight = this.fontSize * 1.2; // Average line height factor
        return Math.floor(this.viewHeight / lineHeight);
    }
}

// Example usage
const data = {
    id: "the-history-of-computers",
    title: "The History of Computers",
    author: "Tech Historian",
    chapters: [
        {
            index: 1,
            title: "The Birth of Computing",
            contant: "<p>In the mid-19th century, a visionary mathematician named Charles Babbage conceptualized the first mechanical computer, known as the Analytical Engine. This groundbreaking idea laid the foundation for modern computing, introducing concepts such as programmable memory, data input/output, and even the basic architecture that computers follow today. Babbage's Analytical Engine, though never fully constructed in his lifetime, was a marvel of innovation and engineering.</p><p>Ada Lovelace, an equally visionary mathematician and writer, recognized the potential of Babbage's machine beyond mere calculation. She wrote the first algorithm intended for a machine, seeing the possibility for computers to handle more than just numbers. Lovelace's insights were far ahead of her time, earning her the title of the first computer programmer. Her work established the idea that computers could process any form of information, from text to music, based on the input they received.</p>"
        },
        {
            index: 2,
            title: "The Rise of the Mainframe",
            contant: "<p>The 1940s and 50s marked the dawn of electronic computing, as the development of large-scale machines took off. The Electronic Numerical Integrator and Computer (ENIAC), developed at the University of Pennsylvania, was one of the earliest electronic general-purpose computers. Utilizing vacuum tubes to perform calculations at unprecedented speeds, the ENIAC was capable of solving complex problems that were previously unimaginable.</p><p>The introduction of IBM's mainframe computers in the 1960s transformed the business landscape, allowing companies to process vast amounts of data efficiently. These machines became the backbone of corporate computing, revolutionizing industries such as finance, healthcare, and government. The era of mainframes established computing as a critical component of business operations and set the stage for future technological advancements.</p>"
        },
        {
            index: 3,
            title: "The Personal Computer Revolution",
            contant: "<p>The late 1970s and early 1980s witnessed a significant shift in computing, as personal computers began to emerge, bringing computing power to the masses. The Apple II, released in 1977, was one of the first highly successful personal computers. With its user-friendly interface and powerful software, it appealed to a wide range of users, from hobbyists to educators and small business owners.</p><p>IBM entered the personal computer market with the IBM PC in 1981, setting a standard for hardware architecture that dominated the industry for decades. The IBM PC's open architecture allowed third-party developers to create compatible hardware and software, leading to a thriving ecosystem of applications and accessories. This combination of hardware advancements and software innovations fueled the PC revolution, making computers accessible to individuals and small businesses.</p>"
        },
        {
            index: 4,
            title: "The Internet Age",
            contant: "<p>The creation of the Internet in the late 20th century revolutionized computing and society as a whole. Originally developed as a military project, the Internet became publicly accessible in the 1990s, changing how people communicated, shared information, and conducted business. The rise of the Internet brought about a new era of global connectivity and information exchange.</p><p>The World Wide Web, invented by Tim Berners-Lee, made the Internet user-friendly and accessible, leading to an explosion of websites and online services. This era marked the transition from standalone computers to interconnected networks, allowing people to access information and communicate with others around the world with ease. The Internet became an integral part of daily life, transforming industries such as media, retail, and entertainment.</p>"
        },
        {
            index: 5,
            title: "The Mobile Computing Era",
            contant: "<p>The 21st century has seen the rise of mobile computing, with smartphones and tablets becoming ubiquitous. These devices have transformed the way people interact with technology, offering convenience and connectivity on the go. Apple's iPhone, launched in 2007, redefined the smartphone industry, integrating powerful computing capabilities with communication and entertainment features.</p><p>The app ecosystem, driven by platforms like Apple's App Store and Google's Play Store, has transformed mobile devices into versatile tools, enabling everything from social networking to complex data analysis. Mobile computing has reshaped industries, creating new opportunities for innovation and entrepreneurship. As technology continues to advance, mobile devices are becoming more powerful and integral to daily life.</p>"
        },
        {
            index: 6,
            title: "The Future of Computing",
            contant: "<p>As technology continues to advance at a rapid pace, the future of computing looks increasingly promising. Developments in artificial intelligence, quantum computing, and cloud computing are set to reshape industries and redefine possibilities. These advancements promise to solve complex problems, enhance decision-making, and drive innovation across various fields.</p><p>The ongoing quest for faster, more efficient computing devices is driving innovation in chip design, with companies exploring new materials and architectures to overcome the limitations of traditional silicon-based technology. The integration of artificial intelligence into everyday devices is transforming how we interact with technology, making it more intuitive and responsive. The future of computing holds the potential to create a more connected, efficient, and intelligent world.</p>"
        }
    ]
};

const viewWidth = 600;  // Width of the display in pixels
const viewHeight = 800; // Height of the display in pixels
const fontSize = 16;    // Font size in pixels

const ebook = new Ebook(data.id, data.title, data.author, data.chapters, viewWidth, viewHeight, fontSize);
const paginatedChapters = ebook.paginateChapters();

paginatedChapters.forEach(chapter => {
    console.log(`Chapter ${chapter.chapterIndex}:`);
    chapter.pages.forEach((page, index) => {
        console.log(`Page ${index + 1}:`);
        console.log(page);
        console.log('---');
    });
});