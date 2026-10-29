/* Looscid helpdata.js: the Help Center's words, in one place (build 195, Carter, Oct 28 2026: a Help Center that teaches anyone
   how to use Looscid, with "articles and links to articles, collections lol like Getting Started").
   Plain script, no module. It only puts LC_HELP on window.Looscid; nothing runs. Two readers use it:
   - the Help Center in the app (js/helpcenter.js), and
   - the Help Center website at looscid.github.io/Looscid/help/ (made from this file by .github/scripts/build-help.mjs).
   After changing anything here, run: node .github/scripts/build-help.mjs (the Validate check fails if the site is out of date).

   Writing rules: for everyone, on any phone or computer, with touch, a mouse or a keyboard. "Press" means tap, click, or Enter
   or Space on a keyboard. Screen reader tips are an optional extra (sr), covering VoiceOver, TalkBack, NVDA, JAWS and Narrator.
   No decorative emoji. Never the word for sharing a Dream that other apps use; we say Dream.
   A link to a Looscid screen is [[Route|Label|Path]]: Route is its address after /Looscid/ (from LC_ROUTES in core.js),
   Label is the screen's name, Path is how to get there by hand. It shows as "Open Label (Path)". A link to another
   article is {{article-id}} or {{article-id|words}}. */
(function () {
  var L = window.Looscid = window.Looscid || {};
  var C = [
    { id: "getting-started", t: "Getting Started", s: "New here? Start with these. Make your LooscidID, log in, and learn your way around." },
    { id: "dreams", t: "Dreams, replies and threads", s: "Write Dreams, reply to them, follow threads, and use Likes, Redreams and the Options menus." },
    { id: "chats-circles-cherry", t: "Chats, Circles and Cherry", s: "Private chats, Circles for groups of Dreamors, Cherry the built-in assistant, and your Inbox." },
    { id: "settings-privacy-backup", t: "Settings, privacy and backup", s: "Find any setting, choose who can reach you, back up your settings, and make Looscid fit you." },
  ];
  var A = [
    /* ---- Getting Started ---- */
    { id: "what-is-looscid", c: "getting-started", t: "What is Looscid?",
      s: "Looscid is a free, open source social app that runs in your web browser, on any phone, tablet or computer.",
      steps: [
        "Open looscid.github.io/Looscid in any web browser. There is nothing to install and nothing to pay.",
        "A Dream is what you share on Looscid: a few words, a photo, a poll or a link. People on Looscid are Dreamors.",
        "Home shows Dreams. Discover helps you find Dreamors and Circles. Inbox has your alerts and private chats. Profile is you.",
        "Circles are groups of Dreamors around one thing you like. Cherry is the assistant built into Looscid.",
        "Everything stays on your device until you choose to send or share it. Looscid has no ads and doesn't sell your data.",
      ],
      tips: ["In this Help Center, press means tap on a touch screen, click with a mouse, or Enter or Space on a keyboard."],
      rel: ["make-a-looscidid", "getting-around"] },
    { id: "make-a-looscidid", c: "getting-started", t: "Make your LooscidID",
      s: "Your LooscidID is your account. Looscid makes it on your device the first time you open it.",
      steps: [
        "Open looscid.github.io/Looscid. The welcome screens start by themselves the first time.",
        "Read the welcome, then press Yes, I'm ready. Or press Skip intro.",
        "Setting up Looscid asks how you use your device. Pick any choices that fit you, or none, then press Set up Looscid. You can change them later.",
        "That's it: your LooscidID now exists on this device. It starts with the name Dreamor and the username @dreamor.",
        "To pick your own name and username, press [[Settings/LooscidID|LooscidID|Profile, More, Settings]], then Profile. You can also press Edit profile on your Profile tab.",
        "To use your LooscidID on another device too, add a login method. See {{log-in}}.",
      ],
      tips: ["Logged out? You're in Guest Mode. Press Create a LooscidID to make one again."],
      rel: ["log-in", "getting-around", "devices-and-data"] },
    { id: "log-in", c: "getting-started", t: "Log in and log out",
      s: "Add a login method to your LooscidID so you can log in with it on other devices.",
      steps: [
        "Press [[Settings/LooscidID|LooscidID|Profile, More, Settings]].",
        "Press Login methods. Your local profile on this device is always on.",
        "Press Add login method, then Choose a network: Nostr, Mastodon and the fediverse, Bluesky, Funkwhale or Hubzilla.",
        "Follow the steps on the screen for that network. For Nostr, you paste your secret key, which starts with nsec1. It stays on this device and is never sent anywhere.",
        "When you link one, you choose whether people can find you by it.",
        "On another device, open Looscid, press Login, and add the same login method.",
        "To log out, press Profile, then More, then Logout. Looscid asks first, so you can't do it by accident.",
      ],
      tips: ["Never share your secret key (nsec) with anyone. Your public key starts with npub1, and that one is safe to share."],
      rel: ["make-a-looscidid", "devices-and-data", "backup"] },
    { id: "getting-around", c: "getting-started", t: "Get around Looscid",
      s: "Where everything is: the tab bar, the top bar, the More menu and the footer.",
      steps: [
        "The tab bar at the bottom has Home, Discover, Create, Inbox and Profile. Press one to go there.",
        "The top bar has the Looscid logo and Create, on every screen.",
        "Press Profile, then More, for everything else: Lists, Drafts, Cherry, Circles, Settings, Commandbar, Help, Feedback and Logout.",
        "Most screens have Back at the top left, and pop-ups have Close.",
        "The footer at the end of every screen has About Looscid, the Changelog, Terms, Privacy and links to Looscid on GitHub, X, YouTube and Discord.",
        "Every screen has its own address, so you can share or bookmark it.",
      ],
      tips: ["On a keyboard: Tab and Shift Tab move, Enter and Space press, and Escape closes. Control K or Command K opens Commandbar from anywhere. See {{commandbar}}."],
      sr: ["Every screen has one heading level 1, so the headings list (VoiceOver rotor, TalkBack headings, NVDA or JAWS H key, Narrator H key) takes you straight to the top of the screen.",
        "Looscid speaks results once, politely, and only moves focus when you do something."],
      rel: ["what-is-looscid", "commandbar", "find-settings"] },
    { id: "commandbar", c: "getting-started", t: "Use Commandbar",
      s: "Commandbar lets you type what you want, like new dream or open settings, and Looscid does it.",
      steps: [
        "Press [[Commandbar|Commandbar|Profile, More]]. On a keyboard, press Control K or Command K from anywhere.",
        "Type a command and press Enter. For example: new dream, open settings or help.",
        "Type help for the top commands, or an area and help for one area, like cherry help.",
        "To see every command as a button, press [[Commands|Commands|Profile, More]].",
        "Anything that isn't a command goes to Cherry, if Cherry is on.",
      ],
      rel: ["getting-around", "cherry"] },

    /* ---- Dreams, replies and threads ---- */
    { id: "write-a-dream", c: "dreams", t: "Write your first Dream",
      s: "A Dream can be a few words, a photo, a poll or a link.",
      steps: [
        "Press Create. It's in the top bar and in the tab bar.",
        "Press Dream. The New Dream screen opens.",
        "Type your Dream in the Dream content box.",
        "If you like, press Add Photo, Add Poll, or Attach for a link or a place.",
        "Press Audience to choose who sees it. Everyone is the default. You can add a Content warning too.",
        "Press Dream. You always press Dream yourself; nothing is sent without you.",
        "Not ready yet? Close it and keep it in [[Drafts|Drafts|Profile, More]].",
      ],
      tips: ["Until you add a Nostr key to your LooscidID, your Dreams are saved only on this device. See {{log-in}}.",
        "Read back my Dream reads it to you before you send it."],
      rel: ["reply", "like-and-redream", "options-menus"] },
    { id: "reply", c: "dreams", t: "Reply to a Dream",
      s: "Replies keep a conversation together in one thread.",
      steps: [
        "Find the Dream. Under it are Replies, Redreams, Likes and More.",
        "Press Replies. The thread opens: the Dream and every reply to it.",
        "Press Reply, type what you want to say, then press Reply again to send it.",
        "Each reply has its own Thread Options button. It opens Reply Options, with things like Copy link.",
      ],
      rel: ["follow-a-thread", "write-a-dream", "options-menus"] },
    { id: "follow-a-thread", c: "dreams", t: "Follow a thread",
      s: "Follow a thread to get an alert when someone replies.",
      steps: [
        "Open the thread by pressing Replies under a Dream.",
        "Press Follow Thread. It's just above the tab bar.",
        "New replies now show up in your Inbox, under Followed Threads.",
        "Your Profile has a Followed Threads tab with every thread you follow.",
        "To stop, press Unfollow Thread in the same place.",
        "Choose who can see the threads you follow in [[Settings/Privacy|Privacy|Profile, More, Settings]], Followed Threads.",
      ],
      rel: ["reply", "inbox", "privacy"] },
    { id: "like-and-redream", c: "dreams", t: "Like, Redream and Quote",
      s: "Show you like a Dream, or share it with your followers.",
      steps: [
        "Under every Dream are Replies, Redreams, Likes and More.",
        "Press Likes to like it. Press it again to undo.",
        "Press Redreams. Choose Redream to share it with your followers as it is, or Quote Dream to add your own words on top.",
        "Your likes are on your Profile, in the Liked tab.",
      ],
      rel: ["options-menus", "write-a-dream"] },
    { id: "options-menus", c: "dreams", t: "Dream Options and Dreamor Options",
      s: "The More button on a Dream, and on someone's profile, holds everything else you can do.",
      steps: [
        "Press More under a Dream. Dream Options opens, with things like Copy link and Pin to profile for your own Dreams.",
        "On your own Dream or reply, Dream Options also has Edit and Delete.",
        "On someone's profile, press More. It has Share profile, Copy link, Add to list, Mute and Block.",
        "Press Close, or Escape on a keyboard, to close a menu without choosing.",
      ],
      rel: ["like-and-redream", "privacy"] },

    /* ---- Chats, Circles and Cherry ---- */
    { id: "start-a-chat", c: "chats-circles-cherry", t: "Start a private chat",
      s: "Chats are private messages between you and one other Dreamor. Only the two of you can read them.",
      steps: [
        "Chats need a Nostr key on your LooscidID. If you don't have one yet, see {{log-in}}.",
        "Press Create, then New Chat. Or press Inbox, press Showing Alerts, choose Chats, then press Send a message.",
        "In To, type who you want to message, then write your message and send it.",
        "Your chats are in Inbox, Chats, under DMs. Requests has chats from people you don't know yet, and Pinned keeps chats at the top.",
        "Choose who can message you in [[Settings/Chats|Chats|Profile, More, Settings]].",
      ],
      tips: ["Chats are end-to-end encrypted with Nostr (NIP-17)."],
      rel: ["inbox", "privacy", "circles"] },
    { id: "circles", c: "chats-circles-cherry", t: "Join or make a Circle",
      s: "A Circle is a group of Dreamors around one thing you like.",
      steps: [
        "Press [[Circles|Circles|Profile, More]].",
        "Press Discover to find Circles to join, or My Circles for the ones you're in.",
        "To make your own, press Create, then Circle, and follow the steps.",
        "If you run a Circle, each member has Member Options for them.",
      ],
      rel: ["start-a-chat", "write-a-dream"] },
    { id: "cherry", c: "chats-circles-cherry", t: "Meet Cherry",
      s: "Cherry is Looscid's assistant. It runs on your device, so your words aren't sent to an AI company.",
      steps: [
        "Turn Cherry on in [[Settings/Cherry|Cherry|Profile, More, Settings]].",
        "The first time, Cherry asks to download its model once. After that it works offline.",
        "Press [[Cherry|Cherry|Profile, More]], or press Create, then New Chat with Cherry.",
        "Type a question and send it. New Chat starts fresh, and Your History keeps your past chats.",
        "Each chat has Chat Options: Pin, Edit name and Delete.",
      ],
      tips: ["Turning Cherry off hides it everywhere."],
      rel: ["commandbar", "find-settings"] },
    { id: "inbox", c: "chats-circles-cherry", t: "Your Inbox and alerts",
      s: "Inbox has your alerts, like replies, mentions and likes, and your private chats.",
      steps: [
        "Press [[Inbox|Inbox|tab bar]].",
        "Showing Alerts switches between Alerts and Chats.",
        "Press All, Unread, Replies, Mentions, Likes and the rest to see one kind of alert.",
        "Press Mark all read when you're caught up.",
        "Each alert has Alert Options.",
        "Choose which alerts you get in [[Settings/Alerts|Alerts|Profile, More, Settings]].",
      ],
      rel: ["start-a-chat", "follow-a-thread"] },

    /* ---- Settings, privacy and backup ---- */
    { id: "find-settings", c: "settings-privacy-backup", t: "Find any setting",
      s: "Settings has every choice in Looscid, and a Search box to find one fast.",
      steps: [
        "Press [[Settings|Settings|Profile, More]].",
        "Type in Search to find a setting by name, or press a group like Privacy or Accessibility.",
        "Reset is the last item in every Settings list. It always asks first and lets you pick what goes back.",
      ],
      rel: ["privacy", "customize", "backup"] },
    { id: "privacy", c: "settings-privacy-backup", t: "Privacy and who can reach you",
      s: "Your Dreams, settings and chats stay on your device until you choose to send or share them.",
      steps: [
        "Press [[Settings/Privacy|Privacy|Profile, More, Settings]].",
        "Private account and Let others share my Dreams are at the top. Press one to turn it on or off.",
        "Permissions chooses who can see and reach you. Blocked and muted lists who you blocked or muted.",
        "Choose who can message you in [[Settings/Chats|Chats|Profile, More, Settings]].",
      ],
      rel: ["options-menus", "devices-and-data", "start-a-chat"] },
    { id: "backup", c: "settings-privacy-backup", t: "Back up and bring back your settings",
      s: "Save every setting as one file, and bring it back on any device.",
      steps: [
        "Press [[Settings/Backup|Backup|Profile, More, Settings, General]].",
        "Press Export all settings. Looscid saves one file.",
        "Keep the file somewhere safe, like your Files app, cloud storage or a USB drive.",
        "On any device, open Backup again and press Import settings from a file, then pick the file.",
      ],
      tips: ["A backup has your settings, Cherry chats and the Circles you made. It never has your keys, passwords or Dreams."],
      rel: ["devices-and-data", "find-settings", "log-in"] },
    { id: "devices-and-data", c: "settings-privacy-backup", t: "Your devices and your data",
      s: "See the devices using your LooscidID and everything Looscid keeps on this device.",
      steps: [
        "Press [[Settings/LooscidID|LooscidID|Profile, More, Settings]].",
        "Press Devices to see this device and any others.",
        "Press Data to see what is stored on this device. You can export it or delete it there.",
        "Security checkup suggests ways to keep your LooscidID safe.",
      ],
      rel: ["backup", "log-in", "privacy"] },
    { id: "customize", c: "settings-privacy-backup", t: "Make Looscid fit you",
      s: "Change how Looscid looks, sounds and moves.",
      steps: [
        "Press [[Settings/Customizability/Theme|Appearance|Profile, More, Settings, Customization]] for colors, text and the heading character.",
        "Press [[Settings/Earcons|Earcons|Profile, More, Settings]] for Looscid's short sounds and their volume.",
        "Press [[Settings/Accessibility|Accessibility|Profile, More, Settings]] for vision, hearing, motion and more. Calm mode is on by default.",
        "Press [[Settings/Keyboard|Keyboard|Profile, More, Settings, General]] for keys and your own shortcuts.",
      ],
      sr: ["Sense, in Accessibility, is how Looscid works with screen readers like VoiceOver, TalkBack, NVDA, JAWS and Narrator, and with braille displays: what it says and how much."],
      rel: ["find-settings", "backup"] },
  ];
  var COURSES = [
    { id: "looscid-basics", t: "Looscid Basics", s: "Learn Looscid from the start, one short lesson at a time. Your progress is saved only on this device.",
      lessons: ["what-is-looscid", "make-a-looscidid", "getting-around", "write-a-dream", "reply", "like-and-redream", "start-a-chat", "find-settings", "backup"] },
  ];
  var CONTACT = {
    id: "contact", t: "Contact Us", s: "Something broken, or an idea? Tell us. Looscid has no email; everything happens in the open.",
    discord: "https://discord.gg/M6xrD8EBXU",
    issues: "https://github.com/Looscid/Looscid/issues",
  };
  L.LC_HELP = { collections: C, articles: A, courses: COURSES, contact: CONTACT, home: "https://looscid.github.io/Looscid/help/" };
})();
