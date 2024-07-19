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
        bookmarks: [20, 60],
        currantPage: 60,
        lastReadDate: new Date("2023-05-12"),
    },
    {
        id: 'you-are-not-listening',
        title: "You're Not Listening",
        author: "Kate Murphy",
        chapters: [
            {
                index: 1,
                title: 'The Lost Art of Listening',
                pageNumber: 2,
            },
            {
                index: 2,
                title: 'That Syncing Feeling: The Neuroscience of Listening',
                pageNumber: 17,
            },
            {
                index: 3,
                title: 'Listening to Your Curiousity: What We Can Learn from Toddlers',
                pageNumber: 32,
            },
            {
                index: 4,
                title: 'I Know What you\'re Going to Say: Assumptions as Earplugs',
                pageNumber: 58,
            },
            {
                index: 5,
                title: 'The Tone-Deaf Response: Why People Would Rather Talk to Their Dog',
                pageNumber: 85,
            },
            {
                index: 6,
                title: 'Talking Like a Tortoise, Thinking Like a Hare: The Speech-Through Differential',
                pageNumber: 101,
            },
            {
                index: 7,
                title: 'Listening to Opposing Views: Why It Feels Like Being Chased by a Bear',
                pageNumber: 130,
            },
            {
                index: 8,
                title: 'Focusing on What\'s Important: Listening in the Age of Big Data',
                pageNumber: 163,
            },
            {
                index: 9,
                title: 'Improvisational Listening: A Funny Thing Happened on the Way to Work',
                pageNumber: 180,
            },
            {
                index: 10,
                title: 'Conversational Sensitivity: What Terry Gross, LBJ, and Con Men Have in Common',
                pageNumber: 207,
            },
            {
                index: 11,
                title: 'Listening to Yourself: The Voluble Inner Voice',
                pageNumber: 220,
            },
            {
                index: 12,
                title: 'Supporting, Not Shifting, the Conversation',
                pageNumber: 245,
            },
            {
                index: 13,
                title: 'Hammers, Anvils, and Stirrups: Turning Sound Waves into Brain Waves',
                pageNumber: 250,
            },
            {
                index: 14,
                title: 'Addicted to Distraction',
                pageNumber: 268,
            },
            {
                index: 15,
                title: 'What Wourld Conceal and Silences Reveal',
                pageNumber: 281,
            },
            {
                index: 16,
                title: 'The Morality of Listening: Why Gossip Is Good for You',
                pageNumber: 302,
            },
            {
                index: 17,
                title: 'When to Stop Listening',
                pageNumber: 319,
            },
        ],
        totalPages: 340,
        bookmarks: [6, 56],
        currantPage: 56,
        lastReadDate: new Date('2024-01-10'),
    },
    {
        id: 'deep-work',
        title: 'Deep Work',
        author: 'Cal Newport',
        chapters: [
            {
                index: 1,
                title: 'Deep Work Is Valuable',
                pageNumber: 2
            },
            {
                index: 2,
                title: 'Deep Work Is Rare',
                pageNumber: 25
            },
            {
                index: 3,
                title: 'Deep Work Is Meaningful',
                pageNumber: 49
            },
            {
                index: 4,
                title: 'The Rules of Deep Work',
                pageNumber: 73
            }
        ],
        totalPages: 100,
        bookmarks: [10, 30, 50],
        currantPage: 40,
        lastReadDate: new Date('2023-08-15')
    },
    {
        id: 'atomic-habits',
        title: 'Atomic Habits',
        author: 'James Clear',
        chapters: [
            {
                index: 1,
                title: 'The Fundamentals',
                pageNumber: 2
            },
            {
                index: 2,
                title: 'The 1% Rule',
                pageNumber: 17
            },
            {
                index: 3,
                title: 'How Habits Work',
                pageNumber: 45
            },
            {
                index: 4,
                title: 'The Four Laws of Behavior Change',
                pageNumber: 69
            }
        ],
        totalPages: 150,
        bookmarks: [15, 45, 65],
        currantPage: 1,
    },
    {
        id: 'thinking-fast-and-slow',
        title: 'Thinking, Fast and Slow',
        author: 'Daniel Kahneman',
        chapters: [
            {
                index: 1,
                title: 'Two Systems',
                pageNumber: 2
            },
            {
                index: 2,
                title: 'Heuristics and Biases',
                pageNumber: 29
            },
            {
                index: 3,
                title: 'Overconfidence',
                pageNumber: 60
            },
            {
                index: 4,
                title: 'Choices',
                pageNumber: 90
            }
        ],
        totalPages: 200,
        bookmarks: [10, 50, 100],
        currantPage: 1,
    },
    {
        id: 'sapiens',
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        chapters: [
            {
                index: 1,
                title: 'The Cognitive Revolution',
                pageNumber: 2
            },
            {
                index: 2,
                title: 'The Agricultural Revolution',
                pageNumber: 40
            },
            {
                index: 3,
                title: 'The Unification of Humankind',
                pageNumber: 100
            },
            {
                index: 4,
                title: 'The Scientific Revolution',
                pageNumber: 150
            }
        ],
        totalPages: 250,
        bookmarks: [30, 70, 120],
        currantPage: 1,
    },
    {
        id: 'the-power-of-habit',
        title: 'The Power of Habit',
        author: 'Charles Duhigg',
        chapters: [
            {
                index: 1,
                title: 'The Habit Loop',
                pageNumber: 2
            },
            {
                index: 2,
                title: 'The Craving Brain',
                pageNumber: 35
            },
            {
                index: 3,
                title: 'The Golden Rule of Habit Change',
                pageNumber: 70
            },
            {
                index: 4,
                title: 'Keystone Habits',
                pageNumber: 105
            }
        ],
        totalPages: 180,
        bookmarks: [20, 60, 90],
        currantPage: 1
    }
];