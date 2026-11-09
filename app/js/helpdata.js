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
        "To pick your own name and username, press [[More/Settings/LooscidID|LooscidID|Profile, More, Settings]], then Profile. You can also press Edit profile on your Profile tab.",
        "To use your LooscidID on another device too, add a login method. See {{log-in}}.",
      ],
      tips: ["Logged out? You're in Guest Mode. Press Create a LooscidID to make one again."],
      rel: ["log-in", "getting-around", "devices-and-data"] },
    { id: "log-in", c: "getting-started", t: "Log in and log out",
      s: "Add a login method to your LooscidID so you can log in with it on other devices.",
      steps: [
        "[[More/Settings/Privacy-and-Security/Login-Methods|See your login methods]]. Your local profile on this device is always on.",
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
        "[[More/Settings/Privacy-and-Security/My-Profile|Choose who can see the threads you follow]].",
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
    /* Nov 8 2026 (Carter: removal reasons are public, with a public mod log that says moderator or admin). live: "modlog"
       puts the log itself under the steps: in the app from js/modreasons.js, on the website from Rem by help.js. */
    { id: "mod-log", c: "dreams", t: "Mod log", live: "modlog",
      s: "Every Dream a Circle's mods or a Looscid admin removed is listed in public, with the date and the reason.",
      steps: [
        "When a Dream is removed, one line takes its place that everyone can read, like \u201cRemoved by the mods of Night Owls. Reason: Spam\u201d or \u201cRemoved by a Looscid admin. Reason: Spam\u201d.",
        "It always says who removed it, a Circle's mods or a Looscid admin, and why. A Dream can't be removed without a reason.",
        "The mod log below lists every removal: the date, which Dream (never its words), moderator or admin, and the reason.",
        "Each Circle has its own mod log too. Open the Circle, go to About, and press Mod log.",
        "Deleting your own Dream is different. If nobody replied, it's just gone. If it has replies, a line saying \u201cDream deleted\u201d stays so the thread still makes sense, with no name and no words.",
      ],
      rel: ["options-menus", "circles", "reply"] },
    /* Nov 8 2026 (Carter: our own issue tracker, "public ... so people can agree or disagree", no other companies). live:
       "issues" puts the Report form and the public list under the steps: in the app from js/issues.js, on the website the
       list only (from Rem, by help.js), because reporting and voting need your Looscid key. */
    { id: "report-a-problem", c: "getting-started", t: "Report a problem", live: "issues",
      s: "Found a bug or got an idea? Report it right in Looscid. Everyone can read the reports, agree or disagree, and see what the mods say.",
      steps: [
        "Open Looscid and press Help Center (Profile, More, Help). Open this article, Report a problem. More, Help, Report a problem opens it too.",
        "Pick Bug or Idea, type a short title and say what happened. Looscid adds the app and its version by itself.",
        "Press Send report. It's signed with your Looscid key, so you need one. No other account, no email.",
        "Every report is in the list below it, for everyone to read: its title, Bug or Idea, its status (new, working on it, fixed or closed) and how many people agree and disagree.",
        "Press Agree or Disagree on any report. You get one vote per report, and you can change it or take it back. Nobody sees who voted, only the counts.",
        "Looscid mods set the status, reply as Looscid mods, and close a report with a reason. All of it is public.",
      ],
      tips: ["Choose Show above the list to see only new, working on it, fixed or closed reports.", "[[More/Settings/LooscidID/Rem|Delete my Rem data]] also deletes your reports and your votes."],
      rel: ["mod-log", "getting-around"] },

    /* Nov 8 2026 (Carter): the Report Center (js/reportcenter.js), every kind of report in one place, private. */
    { id: "report-center", c: "getting-started", t: "Report Center",
      s: "Report a Dream, a person, a Circle or child safety, then follow what happens in My reports and talk to the mods. Reports are private.",
      steps: [
        "Press Report on a Dream (its More button) or on someone's profile (More, Report). The Report Center opens with it filled in. You can also open [[Report|Report Center|Profile, More, Report Center]] yourself.",
        "Pick what you're reporting: a Dream, a person, a Circle, a bug or an idea, or Child safety. Bugs and ideas go to {{report-a-problem}}.",
        "Pick what's wrong: Spam, Mean or bullying, Unsafe or harmful, Child safety, or Something else. Add more info if you want, then press Send report.",
        "Looscid says \u201cur report's submitted. check it in the Report Center anytime\u201d. The person or Circle you reported never finds out who reported them.",
        "My reports lists every report you made with its status: sent, the mods are looking at it, done, or closed. Your bug reports are there too.",
        "Each report is its own thread. Press Thread to read it, add more info for the mods, and see their answers. They reply as Looscid mods.",
        "When the status changes or the mods reply, you get an Alert in Inbox, Alerts.",
      ],
      tips: ["Only you and the Looscid mods can read your reports. Reading them needs your Looscid key.", "If a child is in danger right now, call your local emergency number first.", "[[More/Settings/LooscidID/Rem|Delete my Rem data]] also deletes your reports and their threads."],
      rel: ["report-a-problem", "mod-log", "options-menus"] },

    /* ---- Chats, Circles and Cherry ---- */
    { id: "start-a-chat", c: "chats-circles-cherry", t: "Start a private chat",
      s: "Chats are private messages between you and one other Dreamor. Only the two of you can read them.",
      steps: [
        "Chats need a Nostr key on your LooscidID. If you don't have one yet, see {{log-in}}.",
        "Press Create, then New Chat. Or press Inbox, press Showing Alerts, choose Chats, then press Send a message.",
        "In To, type who you want to message, then write your message and send it.",
        "Your chats are in Inbox, Chats, under DMs. Requests has chats from people you don't know yet, and Pinned keeps chats at the top.",
        "[[More/Settings/Privacy-and-Security/Chats|Choose who can message you]].",
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
        "[[More/Settings/Cherry|Turn Cherry on]]. Cherry's settings are in Customization.",
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
        "[[More/Settings/Alerts|Choose which alerts you get]].",
        "[[More/Settings/Earcons/Alerts|Change how alerts sound]]. They're the same switches as Alert sounds in Alerts, so you can change them from either one.",
        "[[More/Settings/Alerts/Inbox-Filters|Change the order of the Inbox filters]], or hide the ones you don't use.",
      ],
      rel: ["start-a-chat", "follow-a-thread"] },

    /* ---- Settings, privacy and backup ---- */
    { id: "find-settings", c: "settings-privacy-backup", t: "Find any setting",
      s: "Settings has every choice in Looscid, and a Search box to find one fast.",
      steps: [
        "[[More/Settings|Open Settings]].",
        "Type in Search to find a setting by name, or press a group like Privacy & Security or Accessibility.",
        "Reset is the last item in every Settings list. It always asks first and lets you pick what goes back.",
      ],
      rel: ["privacy", "customize", "backup"] },
    { id: "privacy", c: "settings-privacy-backup", t: "Privacy & Security",
      s: "Your Dreams, settings and chats stay on your device until you choose to send or share them.",
      steps: [
        "[[More/Settings/Privacy-and-Security|Choose who can see and reach you]]. Privacy comes first, in 3 parts: My profile, Chats, and Cherry and my stuff. Security is below them.",
        "Private account and Let others share my Dreams are at the top, in My profile. Press one to turn it on or off.",
        "[[More/Settings/Privacy-and-Security/Permissions|Choose who can see, reply to and find you]].",
        "[[More/Settings/Privacy-and-Security/My-Profile|Choose what's on your profile]], like your Circles and the threads you follow.",
        "[[More/Settings/Privacy-and-Security/Blocked-and-Muted|See who and what you blocked or muted]].",
        "[[More/Settings/Privacy-and-Security/What-Cherry-Can-See|Choose what Cherry can see]]. It's the same switches as on Cherry's own screen.",
        "[[More/Settings/Privacy-and-Security/Passcode|Lock your Nostr key with a passcode]], so nothing else on this site can copy it.",
        "[[More/Settings/LooscidID/Download-and-Back-Up|Back up everything and your key in one locked file]], with Backup file.",
        "[[More/Settings/Privacy-and-Security/Security-Checkup|Check how safe your LooscidID is]].",
        "[[More/Settings/Privacy-and-Security/Chats|Choose who can message you]].",
      ],
      rel: ["options-menus", "devices-and-data", "start-a-chat"] },
    { id: "backup", c: "settings-privacy-backup", t: "Back up and bring back your settings",
      s: "Save every setting as one file, and bring it back on any device.",
      steps: [
        "[[More/Settings/LooscidID/Download-and-Back-Up|Open Download and back up]]. Back up my settings is on it.",
        "Press Export all settings. Looscid saves one file.",
        "Keep the file somewhere safe, like your Files app, cloud storage or a USB drive.",
        "On any device, open Download and back up again and press Import settings from a file, then pick the file.",
      ],
      tips: ["A settings backup has your settings, Cherry chats and the Circles you made. It never has your keys, passwords or Dreams. To save your key too, use the Backup file on the same screen."],
      rel: ["devices-and-data", "find-settings", "log-in"] },
    { id: "devices-and-data", c: "settings-privacy-backup", t: "Your data on this device",
      s: "See everything Looscid keeps on this device, and save a copy of it.",
      steps: [
        "[[More/Settings/LooscidID/Data|See what's stored on this device]]. You can delete it there.",
        "[[More/Settings/LooscidID/Download-and-Back-Up|Download or back up your data]]: Export my data, Backup file, Download my Dreams and Back up my settings, each with one line saying what it saves.",
        "[[More/Settings/Privacy-and-Security/Security-Checkup|Check how safe your LooscidID is]]. Security checkup suggests ways to keep it safe.",
      ],
      rel: ["backup", "log-in", "privacy", "rem"] },
    // Nov 8 2026 (Carter: "Rem should get it's own settings section"): Rem's own screen, and its own article.
    { id: "rem", c: "settings-privacy-backup", t: "Rem: your Dreams on every device",
      s: "Rem is Looscid's own server, the home of your public Dreams. Everything about it is on one screen, in LooscidID.",
      steps: [
        "[[More/Settings/LooscidID/Rem|See if Rem is online and which mode you're in]]. Local means your Dreams live on this device; Rem means your public Dreams sync to Rem.",
        "[[More/Settings/LooscidID/Rem|Put your Dreams on Rem]]. Choose All my Dreams, Let me pick, or Not now. Nothing older uploads until you choose.",
        "Your likes, ReDreams, pins, mutes and the threads you follow sync through Rem with your key, so they're the same on all your devices.",
        "[[More/Settings/LooscidID/Rem|Download or delete your Dreams on Rem]]. Delete my Rem data asks first, and Dreams on this device stay.",
        "[[More/Settings/LooscidID/Bridges|Share your public Dreams to other networks too]], with Bridges.",
      ],
      tips: ["I'm working on Sync to my other devices and Just this device switches for your settings. They aren't here yet."],
      rel: ["devices-and-data", "privacy", "backup"] },
    { id: "customize", c: "settings-privacy-backup", t: "Make Looscid fit you",
      s: "Change how Looscid looks, sounds and moves.",
      steps: [
        "[[More/Settings/Customizability/Theme|Change colors, text and the heading character]].",
        "[[More/Settings/Customization|See your Mode and Cherry's settings]]. They're in Customization too, with Settings Order and the tab bar.",
        "[[More/Settings/Earcons|Change Looscid's short sounds and their volume]].",
        "[[More/Settings/Accessibility/Hearing|Swap sounds for a visual cue]]. The same switch is in Earcons too.",
        "[[More/Settings/Accessibility|Change vision, hearing, motion and more]].",
        "[[More/Settings/Accessibility/Motion|Turn Calm motion on or off]]. It's one switch for calmer motion, and it starts out matching your device's Reduce Motion setting. Blocking flashing and strobes stays on unless you turn it off yourself.",
        "[[More/Settings/Keyboard|Change keys and make your own shortcuts]].",
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
