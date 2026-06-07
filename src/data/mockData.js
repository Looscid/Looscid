
export const DREAMS_INIT = [
  {
    id: 1,
    text: "Dreaming of a world where AI and humans collaborate seamlessly. #DreamOS",
    user: { id: 1, name: "Dreamor One", handle: "@dreamor1", verified: true },
    time: "2h",
    comments: 1,
    replies: [
      {
        user: { name: "Collaborator", handle: "@collab" },
        text: "The future is bright!"
      }
    ],
    redreams: 10,
    likes: 25,
    liked: false,
    redreamed: false,
    quoted: false
  }
];

export const USERS = [
  { id: 1, name: "Dreamor One", handle: "@dreamor1", verified: true, followers: 5000 }
];

export const GROUPS = [
  { id: 1, name: "Dream Builders", members: 1200, emoji: "🏗️" }
];

export const TRENDING = [
  { tag: "DreamOS", cat: "Technology", count: "1.2K Dreams" }
];
