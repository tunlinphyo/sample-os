import { Album } from '../../../stores/album.store';
import { Artist } from '../../../stores/artist.store';
import { Song } from '../../../stores/songs.store';

export const ARTISTS: Artist[] = [
    {
        id: '97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa',
        name: 'Death Grips',
        isFavourite: false
    }
];

export const ALBUMS: Album[] = [
    {
        id: 'fb8e5e98-264a-4978-a21e-4041f2c0e730',
        name: "I've Seen Footage",
        cover: '/covers/1.webp',
        releaseDate: new Date("2012-04-19"),
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        isFavourite: false
    },
    {
        id: 'f88d7181-8d26-4645-9801-2bdc8342abc3',
        name: "DXDG",
        cover: '/covers/2.webp',
        releaseDate: new Date("2013-04-04"),
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        isFavourite: false
    }
];

export const SONGS: Song[] = [
    {
        id: 'a8cd7c0f-ff79-43d3-b495-0cd0e7173162',
        title: 'Blackjack',
        music: '/music/Death Grips - Blackjack.mp3',
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        albumId: 'fb8e5e98-264a-4978-a21e-4041f2c0e730',
        isFavourite: false
    },
    {
        id: '7697a4f7-583f-4782-b751-58548b1dd7b2',
        title: 'Get God',
        music: '/music/Death Grips - Get Got.mp3',
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        albumId: 'fb8e5e98-264a-4978-a21e-4041f2c0e730',
        isFavourite: false
    },
    {
        id: '4d88ca4e-edf5-4419-8935-c029efb7bcf7',
        title: "I've Seen Footage",
        music: "/music/Death Grips - I've Seen Footage.mp3",
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        albumId: 'fb8e5e98-264a-4978-a21e-4041f2c0e730',
        isFavourite: false
    },
    {
        id: '4dfe4769-7d33-47a1-90d3-a1db3b178015',
        title: "Lost Boys",
        music: "/music/Death Grips - Lost Boys.mp3",
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        albumId: 'fb8e5e98-264a-4978-a21e-4041f2c0e730',
        isFavourite: false
    },
    {
        id: 'df951d21-f895-47d5-9c03-a34fd9604047',
        title: "The Fever (Aye Aye)",
        music: "/public/music/Death Grips - The Fever (Aye Aye).mp3",
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        albumId: 'fb8e5e98-264a-4978-a21e-4041f2c0e730',
        isFavourite: false
    }
];