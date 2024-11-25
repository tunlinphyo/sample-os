import { Album } from '../../../stores/album.store';
import { Artist } from '../../../stores/artist.store';
import { Song } from '../../../stores/songs.store';

export const ARTISTS: Artist[] = [
    {
        id: '97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa',
        name: 'Death Grips',
        isFavourite: false
    },
    {
        id: '21b6ae89-165a-4309-b3d1-543e279d2530',
        name: 'Com Truise',
        isFavourite: false
    },
    {
        id: '74be0d87-43a1-4f8c-bc06-20ac9c071a6c',
        name: 'Dillon',
        isFavourite: false
    },
    {
        id: '4c22869b-3ab5-44fd-b868-c1e946d66e70',
        name: 'Nils Frahm',
        isFavourite: false
    }
];

export const ALBUMS: Album[] = [
    {
        id: 'fb8e5e98-264a-4978-a21e-4041f2c0e730',
        name: "The Money Store",
        cover: '/covers/1.webp',
        releaseDate: new Date("2012-04-19"),
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        isFavourite: true,
        order: 0,
    },
    {
        id: 'f88d7181-8d26-4645-9801-2bdc8342abc3',
        name: "DXDG",
        cover: '/covers/2.webp',
        releaseDate: new Date("2013-04-04"),
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        isFavourite: false,
        order: 1,
    },
    {
        id: '78914086-043c-4a87-a5f4-30abb76aa674',
        name: "Cyanide Sisters EP",
        cover: '/covers/2.webp',
        releaseDate: new Date("2011-01-24"),
        artistIds: ['21b6ae89-165a-4309-b3d1-543e279d2530'],
        isFavourite: true,
        order: 3,
    },
    {
        id: '9863acb9-a73c-4701-b3ff-2ac0d7e71e6a',
        name: "This Silence Kills",
        cover: '/covers/2.webp',
        releaseDate: new Date("2011-11-11"),
        artistIds: ['74be0d87-43a1-4f8c-bc06-20ac9c071a6c'],
        isFavourite: true,
        order: 2,
    },
    {
        id: '0d7e725d-e936-4598-acba-3c4e2c6ab6d7',
        name: "Screws",
        cover: '/covers/2.webp',
        releaseDate: new Date("2012-09-20"),
        artistIds: ['4c22869b-3ab5-44fd-b868-c1e946d66e70'],
        isFavourite: false,
        order: 4,
    },
    {
        id: '1efa6be0-8881-4ad8-ac63-fd0734f9c4aa',
        name: "Exmilitary",
        cover: '/covers/2.webp',
        releaseDate: new Date("2011-04-25"),
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        isFavourite: false,
        order: 5,
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
        isFavourite: true
    },
    {
        id: '4d88ca4e-edf5-4419-8935-c029efb7bcf7',
        title: "I've Seen Footage",
        music: "/music/Death Grips - I've Seen Footage.mp3",
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        albumId: 'fb8e5e98-264a-4978-a21e-4041f2c0e730',
        isFavourite: true
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
        title: "The Fever",
        music: "/music/Death Grips - The Fever (Aye Aye).mp3",
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        albumId: 'fb8e5e98-264a-4978-a21e-4041f2c0e730',
        isFavourite: true
    },
    {
        id: 'c1381f07-c120-4dc1-bb9d-f3ceff1b7cd8',
        title: "Cyanide Sisters",
        music: "/music/Com Truise - Cyanide Sisters.mp3",
        artistIds: ['21b6ae89-165a-4309-b3d1-543e279d2530'],
        albumId: '78914086-043c-4a87-a5f4-30abb76aa674',
        isFavourite: false
    },
    {
        id: '03bb38a0-6d95-4d3a-ae96-09d39f316da0',
        title: "Slow Peels",
        music: "/music/Com Truise - Slow Peels.mp3",
        artistIds: ['21b6ae89-165a-4309-b3d1-543e279d2530'],
        albumId: '78914086-043c-4a87-a5f4-30abb76aa674',
        isFavourite: true
    },
    {
        id: '0fa89f9e-2c0e-4724-bbbb-55b662404b11',
        title: "Sundriped",
        music: "/music/Com Truise - Sundriped.mp3",
        artistIds: ['21b6ae89-165a-4309-b3d1-543e279d2530'],
        albumId: '78914086-043c-4a87-a5f4-30abb76aa674',
        isFavourite: true
    },
    {
        id: 'f1a81578-959e-496c-bd3c-75e41cb3d00c',
        title: "Thirteen Thirtyfive",
        music: "/music/Dillon - Thirteen Thirtyfive.mp3",
        artistIds: ['74be0d87-43a1-4f8c-bc06-20ac9c071a6c'],
        albumId: '9863acb9-a73c-4701-b3ff-2ac0d7e71e6a',
        isFavourite: true
    },
    {
        id: '67ff05bb-74dc-448e-8bdf-c0c574239daa',
        title: "Do",
        music: "/music/Nils Frahm - Do.mp3",
        artistIds: ['4c22869b-3ab5-44fd-b868-c1e946d66e70'],
        albumId: '0d7e725d-e936-4598-acba-3c4e2c6ab6d7',
        isFavourite: false
    },
    {
        id: 'e51d01b2-549e-450a-a907-f74ed05c6988',
        title: "Fa",
        music: "/music/Nils Frahm - Fa.mp3",
        artistIds: ['4c22869b-3ab5-44fd-b868-c1e946d66e70'],
        albumId: '0d7e725d-e936-4598-acba-3c4e2c6ab6d7',
        isFavourite: false
    },
    {
        id: '2de1bace-8741-42b0-9455-d9649a242aea',
        title: "La",
        music: "/music/Nils Frahm - La.mp3",
        artistIds: ['4c22869b-3ab5-44fd-b868-c1e946d66e70'],
        albumId: '0d7e725d-e936-4598-acba-3c4e2c6ab6d7',
        isFavourite: false
    },
    {
        id: '1302e3d6-47c7-4e62-8045-e54854ceabf7',
        title: "Me",
        music: "/music/Nils Frahm - Me.mp3",
        artistIds: ['4c22869b-3ab5-44fd-b868-c1e946d66e70'],
        albumId: '0d7e725d-e936-4598-acba-3c4e2c6ab6d7',
        isFavourite: false
    },
    {
        id: 'cc30c53b-fb64-4595-9dde-6eeadee7293d',
        title: "Mi",
        music: "/music/Nils Frahm - Mi.mp3",
        artistIds: ['4c22869b-3ab5-44fd-b868-c1e946d66e70'],
        albumId: '0d7e725d-e936-4598-acba-3c4e2c6ab6d7',
        isFavourite: false
    },
    {
        id: '3f0832d4-5e28-4c9b-a84e-27ad8ec59c29',
        title: "Re",
        music: "/music/Nils Frahm - Re.mp3",
        artistIds: ['4c22869b-3ab5-44fd-b868-c1e946d66e70'],
        albumId: '0d7e725d-e936-4598-acba-3c4e2c6ab6d7',
        isFavourite: false
    },
    {
        id: 'b5a7bce5-e161-4dd7-ba83-c990179ea9f9',
        title: "Said And Done",
        music: "/music/Nils Frahm - Said And Done.mp3",
        artistIds: ['4c22869b-3ab5-44fd-b868-c1e946d66e70'],
        albumId: '0d7e725d-e936-4598-acba-3c4e2c6ab6d7',
        isFavourite: false
    },
    {
        id: '5725d36c-4b55-4236-9352-d771f04b2c53',
        title: "Sol",
        music: "/music/Nils Frahm - Sol.mp3",
        artistIds: ['4c22869b-3ab5-44fd-b868-c1e946d66e70'],
        albumId: '0d7e725d-e936-4598-acba-3c4e2c6ab6d7',
        isFavourite: false
    },
    {
        id: 'abc43e38-7c62-4504-b15c-a3b1f94d7643',
        title: "You",
        music: "/music/Nils Frahm - You.mp3",
        artistIds: ['4c22869b-3ab5-44fd-b868-c1e946d66e70'],
        albumId: '0d7e725d-e936-4598-acba-3c4e2c6ab6d7',
        isFavourite: false
    },
    {
        id: 'd117b472-0fb1-4533-9468-c61cf52fb2d9',
        title: '5D',
        music: '/music/Death Grips - 5D.mp3',
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        albumId: '1efa6be0-8881-4ad8-ac63-fd0734f9c4aa',
        isFavourite: false
    },
    {
        id: 'f03b743e-8d3e-4521-a06b-48f584102e4a',
        title: 'Artificial Death in the West',
        music: '/music/Death Grips - Artificial Death in the West.mp3',
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        albumId: 'f88d7181-8d26-4645-9801-2bdc8342abc3',
        isFavourite: false
    },
    {
        id: 'eae3aff7-66b6-4db6-83a0-2033351cdf78',
        title: 'Stars Out the Sky',
        music: '/music/Death Grips - Bass Rattle Stars Out the Sky.mp3',
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        albumId: 'f88d7181-8d26-4645-9801-2bdc8342abc3',
        isFavourite: false
    },
    {
        id: '28e52457-23a1-48fa-ad1e-c66ec76c5229',
        title: 'Black Dice',
        music: '/music/Death Grips - Black Dice.mp3',
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        albumId: 'fb8e5e98-264a-4978-a21e-4041f2c0e730',
        isFavourite: false
    },
    {
        id: '2bc5ef66-2626-4e60-9f73-bebe3b250cab',
        title: 'Blood Creepin',
        music: '/music/Death Grips - Blood Creepin.mp3',
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        albumId: 'fb8e5e98-264a-4978-a21e-4041f2c0e730',
        isFavourite: false
    },
    {
        id: '65d28afb-0288-4d51-a1e3-9b4d31cd7b47',
        title: 'Culture Shock',
        music: '/music/Death Grips - Culture Shock.mp3',
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        albumId: '1efa6be0-8881-4ad8-ac63-fd0734f9c4aa',
        isFavourite: false
    },
    {
        id: '591d3143-8347-49f4-9c8c-a82f3278fc8a',
        title: 'Deep Web',
        music: '/music/Death Grips - Deep Web.mp3',
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        albumId: '1efa6be0-8881-4ad8-ac63-fd0734f9c4aa',
        isFavourite: false
    },
    {
        id: '71a4b113-6c5c-47d6-97f1-8ff8f0a6a678',
        title: 'Full Moon',
        music: '/music/Death Grips - Full Moon (Death Classic).mp3',
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        albumId: 'f88d7181-8d26-4645-9801-2bdc8342abc3',
        isFavourite: false
    },
    {
        id: 'a23c1143-4917-4027-8405-9807a89f412d',
        title: 'Hunger Games',
        music: '/music/Death Grips - Hunger Games.mp3',
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        albumId: 'f88d7181-8d26-4645-9801-2bdc8342abc3',
        isFavourite: false
    },
    {
        id: '31a37579-469d-44fb-bbd5-33ef029bc200',
        title: 'Klink',
        music: '/music/Death Grips - Klink.mp3',
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        albumId: '1efa6be0-8881-4ad8-ac63-fd0734f9c4aa',
        isFavourite: false
    },
    {
        id: 'b6ae8dee-439f-40ca-8822-df33b66ebba7',
        title: 'Known for It',
        music: '/music/Death Grips - Known for It.mp3',
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        albumId: 'f88d7181-8d26-4645-9801-2bdc8342abc3',
        isFavourite: false
    },
    {
        id: 'c7282b99-ff4b-45f6-9429-6701f9d1fc5c',
        title: 'Lil Boy',
        music: '/music/Death Grips - Lil Boy.mp3',
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        albumId: '1efa6be0-8881-4ad8-ac63-fd0734f9c4aa',
        isFavourite: false
    },
    {
        id: '1f06d0ea-c8ea-4b55-90b1-94907d009bdb',
        title: 'Lock Your Doors',
        music: '/music/Death Grips - Lock Your Doors.mp3',
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        albumId: 'fb8e5e98-264a-4978-a21e-4041f2c0e730',
        isFavourite: false
    },
    {
        id: 'eea48577-f534-4ef2-a35c-4b0c250cef8b',
        title: 'Lord of the Game',
        music: '/music/Death Grips - Lord of the Game (ft. Mexican Girl).mp3',
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        albumId: '1efa6be0-8881-4ad8-ac63-fd0734f9c4aa',
        isFavourite: false
    },
    {
        id: '3ab595f4-8a0c-4ca2-9547-21f6ab4a2644',
        title: 'Pop',
        music: '/music/Death Grips - Pop.mp3',
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        albumId: 'fb8e5e98-264a-4978-a21e-4041f2c0e730',
        isFavourite: false
    },
    {
        id: 'cbba93ae-3897-43ba-aa67-cb11ffc8eef2',
        title: 'Stockton',
        music: '/music/Death Grips - Stockton.mp3',
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        albumId: '1efa6be0-8881-4ad8-ac63-fd0734f9c4aa',
        isFavourite: false
    },
    {
        id: 'e29942e1-35f7-4582-872e-b3cd9de03a05',
        title: 'Thru the Walls',
        music: '/music/Death Grips - Thru the Walls.mp3',
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        albumId: 'fb8e5e98-264a-4978-a21e-4041f2c0e730',
        isFavourite: false
    },
    {
        id: '84dd284e-c463-4476-b07f-46e02c667bf5',
        title: 'Whammy',
        music: '/music/Death Grips - Whammy.mp3',
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        albumId: '1efa6be0-8881-4ad8-ac63-fd0734f9c4aa',
        isFavourite: false
    },
    {
        id: '55e2e285-d4e9-47f8-9c88-4d7080945af8',
        title: 'World of Dogs',
        music: '/music/Death Grips - World of Dogs.mp3',
        artistIds: ['97c9b3cb-c589-4fc6-8dc6-b5c8e74b5caa'],
        albumId: '1efa6be0-8881-4ad8-ac63-fd0734f9c4aa',
        isFavourite: false
    },
];