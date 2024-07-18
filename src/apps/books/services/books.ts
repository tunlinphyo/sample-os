import { Book } from '../../../stores/books.store';

export const BOOKS: Book[] = [
    {
        id: 'the-winner-effect',
        title: 'The Winner Effect',
        author: 'Ian H. Robertson',
        chapters: [
            {
                index: 1,
                title: 'The Mystery of Picasso\'s Son',
                pageNumber: 2
            },
            {
                index: 2,
                title: 'The Puzzle of Changeling Fish',
                pageNumber: 25
            },
            {
                index: 3,
                title: 'The Engma of Bill Clinton\'s Friend',
                pageNumber: 59
            },
            {
                index: 4,
                title: 'The Mystery of the Oscars',
                pageNumber: 68
            },
            {
                index: 5,
                title: 'The Riddle of the Flying CEOs',
                pageNumber: 89
            },
            {
                index: 6,
                title: 'The Winning Mind',
                pageNumber: 120
            },
        ],
        totalPages: 142,
        bookmarks: [],
        currantPage: 1
    }
];