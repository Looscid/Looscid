const ORIGINALS = {id:99,name:"The Originals",handle:"@originals",bio:"These Dreams were here before you were. When Dream Board was just getting started, these Dreams kept the feed alive. Now you are here creating it. Thank you.",initials:"OR",color:"#7c3aed",verified:true,location:"The Beginning",website:"dream-os.pages.dev",joined:"February 2024",dreamCount:6,followers:0,following:0,isOriginals:true};
const USERS = [
  {id:1,name:"Maya Chen",handle:"@mayac",bio:"Software dev by day, amateur chef by night 🍜 she/her",initials:"MC",color:"#6d28d9",verified:true,location:"San Francisco, CA",website:"mayachen.dev",joined:"March 2023",dreamCount:4821,followers:38200,following:892},
  {id:2,name:"Jake Torres",handle:"@jakeT",bio:"Football fan, dad of 2, occasional runner 🏃",initials:"JT",color:"#0e7490",verified:false,location:"Austin, TX",website:null,joined:"January 2023",dreamCount:1240,followers:12700,following:3100},
  {id:3,name:"Priya Nair",handle:"@priyanair",bio:"Product designer · dog mum · making things look nice 🎨",initials:"PN",color:"#be185d",verified:true,location:"London, UK",website:"priyanair.co",joined:"July 2022",dreamCount:6330,followers:91400,following:1240},
  {id:4,name:"Marcus Webb",handle:"@marcuswebb",bio:"Music, food, and trying to keep my plants alive 🌱",initials:"MW",color:"#1d4ed8",verified:false,location:"Chicago, IL",website:null,joined:"October 2022",dreamCount:2180,followers:44300,following:5600},
  {id:5,name:"Sam Rivera",handle:"@samr",bio:"Student · coffee addict · posting whatever I feel like 🤷",initials:"SR",color:"#15803d",verified:false,location:"Miami, FL",website:null,joined:"April 2023",dreamCount:890,followers:7200,following:2900},
  {id:6,name:"DreamOS",handle:"@DreamBMobile",bio:"The official DreamOS account 🌙 Share what's on your mind.",initials:"DB",color:"#6d28d9",verified:true,location:"Everywhere",website:"dream-os.pages.dev",joined:"January 2023",dreamCount:412,followers:1200000,following:0},
];
const ME = {id:0,name:"Guest",handle:"@guest",initials:"DD",bio:"Just checking out Dream Board 👋",color:"#6d28d9",verified:false,location:"",joined:"March 2026",dreamCount:2,followers:3,following:7,age:25};

const DREAMS_INIT = [
  {id:1,user:ORIGINALS,time:"2m",text:"ok whoever invented the croissant deserves a statue. that's my entire thought.",likes:6201,comments:441,redreams:1820,quotes:93,liked:false,redreamed:false,quoted:false,bookmarked:false},
  {id:2,user:ORIGINALS,time:"14m",text:"my 4 year old just told me my cooking \"tastes like a Tuesday\" and I genuinely don't know what that means but I'm offended",likes:28400,comments:1830,redreams:9200,quotes:340,liked:false,redreamed:false,quoted:false,bookmarked:false},
  {id:3,user:ORIGINALS,time:"45m",text:"redesigned our app's onboarding today and cut it from 7 screens to 3. signups are already up 18% in testing. less is almost always more ✂️",likes:4103,comments:287,redreams:934,quotes:88,liked:false,redreamed:false,quoted:false,bookmarked:false},
  {id:4,user:ORIGINALS,time:"2h",text:"found a playlist I made in 2019 and it genuinely slaps. past me had taste I don't deserve \ud83c\udfb5 Listen to: Blinding Lights, The Weeknd",likes:9870,comments:612,redreams:2100,quotes:74,liked:false,redreamed:false,quoted:false,bookmarked:false},
  {id:5,user:ORIGINALS,time:"4h",text:"professor said \"no phones\" so naturally I'm on my phone. anyway does anyone have the notes from last Tuesday",likes:31200,comments:2440,redreams:11300,quotes:890,liked:false,redreamed:false,quoted:false,bookmarked:false},
  {id:6,user:ORIGINALS,time:"8h",text:"Welcome to Dream Board \ud83d\udc4b\n\nShare what's on your mind. Your thoughts, your takes, your moments \u2014 big or small.\n\nNo ads. No algorithm hiding your posts. Just you and the people you follow.\n\n#DreamBoard",likes:18402,comments:2104,redreams:9134,quotes:1204,liked:false,redreamed:false,quoted:false,bookmarked:false},
];

const MOCK_COMMENTS = {
  1:[
    {id:1,user:USERS[2],text:"I'm crying 😂 Tuesday cooking is so real",time:"1m",likes:341,liked:false},
    {id:2,user:USERS[3],text:"Tuesday as in bland? Or Tuesday as in weirdly specific?",time:"3m",likes:89,liked:true},
    {id:3,user:USERS[4],text:"kids are unfiltered critics and I respect it",time:"8m",likes:204,liked:false},
  ],
  2:[
    {id:1,user:USERS[0],text:"I showed this to my husband and he said 'well what day DOES your cooking taste like' 💀",time:"5m",likes:1820,liked:true},
    {id:2,user:USERS[2],text:"update us on what Tuesday means. for science.",time:"12m",likes:490,liked:false},
  ],
  3:[
    {id:1,user:USERS[1],text:"18% is massive. what did you cut?",time:"10m",likes:78,liked:false},
    {id:2,user:USERS[3],text:"the 'verify your email' screen does more damage than people admit",time:"22m",likes:193,liked:true},
  ],
  4:[
    {id:1,user:USERS[0],text:"2019 playlists hit different. no idea why",time:"30m",likes:412,liked:false},
    {id:2,user:USERS[4],text:"saving this",time:"1h",likes:28,liked:false},
  ],
  5:[
    {id:1,user:USERS[2],text:"lmaoooo this is me every single week",time:"1h",likes:2100,liked:true},
    {id:2,user:USERS[3],text:"the audacity to post this while skipping is sending me",time:"1h",likes:880,liked:false},
    {id:3,user:USERS[0],text:"i have the notes if you dm me but you owe me a coffee",time:"2h",likes:340,liked:false},
  ],
};

const CONVOS = [
  {id:1,user:USERS[1],preview:"Tuesday 😭 I'm deceased",time:"now",unread:2,msgs:[{id:1,me:false,text:"ok I asked him. apparently Tuesday means 'fine but not exciting'. I'm going to cry"},{id:2,me:false,text:"Tuesday 😭 I'm deceased"}]},
  {id:2,user:USERS[2],preview:"yes send me the onboarding breakdown",time:"3m",unread:1,msgs:[{id:1,me:false,text:"that 18% stat is wild, yes send me the onboarding breakdown pls"}]},
  {id:3,user:USERS[0],preview:"I'll send you the notes 😂",time:"18m",unread:0,msgs:[{id:1,me:true,text:"do you actually have the notes lol"},{id:2,me:false,text:"I'll send you the notes 😂"}]},
];

const NOTIFS_INIT = [
  {id:1,type:"like",user:USERS[0],text:"liked your Dream",preview:"ok whoever invented the croissant…",time:"2m",unread:true},
  {id:2,type:"follow",user:USERS[1],text:"started following you",time:"15m",unread:true},
  {id:3,type:"comment",user:USERS[2],text:"commented on your Dream",preview:'"Tuesday \ud83d\ude2d I\'m deceased"',time:"32m",unread:true},
  {id:4,type:"redream",user:USERS[3],text:"ReDreamed your Dream",preview:"found a playlist I made in 2019…",time:"1h",unread:false},
  {id:5,type:"mention",user:USERS[4],text:"mentioned you in a Dream",preview:"…@demodreamer has the notes apparently",time:"2h",unread:false},
];

const GROUPS = [
  {id:1,name:"Tech & Builds",emoji:"💻",members:31400,category:"Technology",description:"Developers, designers and builders sharing what they're working on.",joined:true},
  {id:2,name:"Food & Recipes",emoji:"🍳",members:24700,category:"Food",description:"Home cooks, foodies and restaurant tips. Post what you're eating.",joined:false},
  {id:3,name:"Sport Talk",emoji:"⚽",members:18900,category:"Sports",description:"Scores, takes, highlights and arguments about the beautiful game.",joined:false},
  {id:4,name:"Just Vibes",emoji:"✨",members:41200,category:"General",description:"Memes, thoughts, random stuff. No theme, all welcome.",joined:true},
];

const TRENDING = [
  {tag:"CroissantGate",cat:"Trending",count:"61,400 Dreams"},
  {tag:"TuesdayCooking",cat:"Trending",count:"29,800 Dreams"},
  {tag:"NowPlaying",cat:"Music",count:"18,200 Dreams"},
  {tag:"TechBuilds",cat:"Technology",count:"12,700 Dreams"},
];

const SORT_OPTIONS = [

