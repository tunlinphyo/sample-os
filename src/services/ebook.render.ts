export interface Content {
    id: string;
    text: string;
}

export class EbookRender {
    constructor(
        private parentEl: HTMLElement,
        private contents: Content[]
    ) {

    }

    public getContents() {
        let total = 0;
        const list = this.contents.map(item => {
            const { pages, totalPages } = this.paginate(item);
            const startPage = total + 1;
            total += totalPages;
            return {
                id: item.id,
                pages,
                startPage,
                endPage: total
            }
        })

        return { list, total };
    }

    // private paginate(content: Content) {
    //     const words = this.modifyString(content.text).split(' ');
    //     const tempDiv = document.createElement('div');
    //     tempDiv.style.position = 'absolute';
    //     tempDiv.style.width = `${this.parentEl.clientWidth}px`;
    //     tempDiv.style.fontSize = '16px';
    //     tempDiv.style.lineHeight = '1.6';
    //     tempDiv.style.padding = '52px 16px 29px';
    //     this.parentEl.appendChild(tempDiv);

    //     let pageContent = '';
    //     const pages: string[] = [];

    //     for (let i = 0; i < words.length; i++) {
    //         tempDiv.innerHTML = pageContent + words[i] + ' ';
    //         if (tempDiv.scrollHeight > this.parentEl.clientHeight) {
    //             pages.push(pageContent.trim());
    //             pageContent = words[i] + ' ';
    //         } else {
    //             pageContent += words[i] + ' ';
    //         }
    //     }

    //     if (pageContent.trim()) {
    //         pages.push(pageContent.trim());
    //     }

    //     this.parentEl.removeChild(tempDiv);

    //     if (!pages.length) pages.push('');

    //     return { pages, totalPages: pages.length }
    // }

    private paginate(content: Content) {
        const tokens = this.tokenizeContent(content.text);
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.width = `${this.parentEl.clientWidth}px`;
        tempDiv.style.fontSize = '16px';
        tempDiv.style.lineHeight = '1.6';
        tempDiv.style.padding = '52px 16px 29px';
        tempDiv.style.visibility = 'hidden'; // Hide the tempDiv
        this.parentEl.appendChild(tempDiv);

        let pageContent = '';
        const pages: string[] = [];
        const openTags: string[] = [];

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            // Update openTags stack
            if (this.isOpeningTag(token)) {
                const tagName = this.getTagName(token);
                openTags.push(tagName);
            } else if (this.isClosingTag(token)) {
                openTags.pop();
            }

            const potentialContent = pageContent + token;
            tempDiv.innerHTML = potentialContent + this.getClosingTags(openTags);

            if (tempDiv.scrollHeight > this.parentEl.clientHeight) {
                if (pageContent.trim()) {
                    // Close any open tags for the current page
                    const pageContentWithClosingTags = pageContent + this.getClosingTags(openTags);
                    pages.push(pageContentWithClosingTags.trim());
                }
                // Start new page content with any open tags
                pageContent = this.getOpeningTags(openTags) + token;
            } else {
                pageContent = potentialContent;
            }
        }

        if (pageContent.trim()) {
            // Close any remaining open tags
            const pageContentWithClosingTags = pageContent + this.getClosingTags(openTags);
            pages.push(pageContentWithClosingTags.trim());
        }

        this.parentEl.removeChild(tempDiv);

        if (!pages.length) pages.push('');

        return { pages, totalPages: pages.length };
    }

    /**
     * Tokenizes the content string into an array of tokens,
     * where HTML tags are separate tokens, and text content is split by spaces.
     * Also replaces <a> tags with <span> tags and removes <img> tags.
     */
    private tokenizeContent(content: string): string[] {
        const tokens: string[] = [];
        const regex = /(<[^>]+>)|([^<]+)/g;
        let match;

        while ((match = regex.exec(content)) !== null) {
            if (match[1]) {
                // It's an HTML tag
                const tag = match[1];
                const processedTag = this.processTag(tag);
                if (processedTag) {
                    tokens.push(processedTag);
                }
                // If processedTag is null, the tag is skipped (e.g., <img> tag)
            } else if (match[2]) {
                // It's text content, split by spaces
                const words = match[2].split(/\s+/).filter(word => word.length > 0);
                tokens.push(...words.map(word => word + ' '));
            }
        }

        return tokens;
    }

    /**
     * Processes an HTML tag by replacing <a> tags with <span> tags
     * and removing <img> tags. Returns the processed tag or null if it should be skipped.
     */
    private processTag(tag: string): string | null {
        // Remove <img> tags
        if (/^<img\b[^>]*>/i.test(tag)) {
            // Skip <img> tags
            return null;
        }

        // Replace <a> tags with <span> tags
        const openingATagMatch = /^<a\b([^>]*)>/i.exec(tag);
        if (openingATagMatch) {
            // Opening <a> tag with attributes
            const attributes = openingATagMatch[1];
            // Replace with <span> and keep attributes if desired
            return '<span' + attributes + '>';
        } else if (/^<\/a>/i.test(tag)) {
            // Replace closing </a> tag with </span>
            return '</span>';
        } else {
            // Return the tag as is
            return tag;
        }
    }

    /**
     * Checks if the token is an opening HTML tag.
     */
    private isOpeningTag(token: string): boolean {
        return /^<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>$/.test(token) && !/^<\//.test(token) && !/\/>$/.test(token);
    }

    /**
     * Checks if the token is a closing HTML tag.
     */
    private isClosingTag(token: string): boolean {
        return /^<\/[a-zA-Z][a-zA-Z0-9]*>$/.test(token);
    }

    /**
     * Extracts the tag name from an HTML tag token.
     */
    private getTagName(tag: string): string {
        const match = /^<\/?([a-zA-Z][a-zA-Z0-9]*)/.exec(tag);
        return match ? match[1] : '';
    }

    /**
     * Generates closing tags for the current open tags stack.
     */
    private getClosingTags(openTags: string[]): string {
        return openTags.slice().reverse().map(tag => `</${tag}>`).join('');
    }

    /**
     * Generates opening tags for the current open tags stack.
     */
    private getOpeningTags(openTags: string[]): string {
        return openTags.map(tag => `<${tag}>`).join('');
    }

    private modifyString(text: string) {
        let replaced = text.replace(/\n/g, ' <br><br> ');

        // const replace = [
        //     "THE GOLDEN RULE OF HABIT CHANGE",
        //     "THE HABIT LOOP",
        //     "THE CRAVING BRAIN",
        //     "KEYSTONE HABITS, OR THE BALLAD OF PAUL O’NEILL",
        //     "STARBUCKS AND THE HABIT OF SUCCESS",
        //     "THE POWER OF A CRISIS",
        //     "HOW TARGET KNOWS WHAT YOU WANT BEFORE YOU DO",
        //     "SADDLEBACK CHURCH AND THE MONTGOMERY BUS BOYCOTT",
        //     "THE NEUROLOGY OF FREE WILL",
        // ]


        // replace.forEach(rep => {
        //     if (text.startsWith(rep)) {
        //         replaced = replaced.replace(rep, `<h2>${rep}</h2><br><br> `)
        //     }
        // })

        // const replace = {
        //     "PART 2The Rules": "PART 2 <br><br> The Rules"
        // }

        // Object.entries(replace).forEach(([key, value]) => {
        //     if (text.startsWith(key)) {
        //         replaced = replaced.replace(key, value)
        //     }
        // })

        return replaced;
    }
}