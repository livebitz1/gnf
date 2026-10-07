export interface TournamentRecord {
  id: string;
  title: string;
  subtitle: string;
  gameType: string;
  prizePool: string;
  firstPrize: string;
  secondPrize: string;
  thirdPrize: string;
  entryFee: string;
  maxSlots: number;
  filledSlots: number;
  region: string;
  status: "OPEN" | "REGISTRATION_CLOSED" | "LIVE" | "COMPLETED" | "REMOVED";
  matchStartTime: string;
}

export interface RegistrationRecord {
  id: string;
  tournamentId: string;
  tournamentTitle: string;
  gameType: string;
  userId: string;
  userGamertag: string;
  teamName: string;
  teamTag?: string;
  captainIgn: string;
  captainGameId: string;
  rankTier?: string;
  roster: Array<{ name: string; id: string; role?: string }>;
  contactHandle: string;
  contactType: "DISCORD" | "WHATSAPP";
  deviceInfo?: string;
  pushToken?: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "CHECKED_IN";
  rejectionReason?: string;
  roomId?: string;
  roomPass?: string;
  serverInfo?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface GameRecord {
  id: string;
  name: string;
  tag: string;
  color: string;
  cardBg?: string;
  borderColor?: string;
  isActive: boolean;
  displayOrder: number;
  liveCount?: number;
  createdAt?: string;
}

// Default Games Configuration
export const initialGames: GameRecord[] = [
  {
    id: "game-val",
    name: "Valorant",
    tag: "VAL",
    color: "#FF2E93",
    cardBg: "#FDF2F8",
    borderColor: "#FCE7F3",
    isActive: true,
    displayOrder: 1,
  },
  {
    id: "game-bgmi",
    name: "BGMI",
    tag: "BGMI",
    color: "#111827",
    cardBg: "#F3F4F6",
    borderColor: "#E5E7EB",
    isActive: true,
    displayOrder: 2,
  },
  {
    id: "game-ff",
    name: "Free Fire",
    tag: "FF",
    color: "#F59E0B",
    cardBg: "#FFFBEB",
    borderColor: "#FEF3C7",
    isActive: true,
    displayOrder: 3,
  },
  {
    id: "game-cs2",
    name: "CS2",
    tag: "CS2",
    color: "#6366F1",
    cardBg: "#F5F3FF",
    borderColor: "#EDE9FE",
    isActive: true,
    displayOrder: 4,
  },
  {
    id: "game-tk8",
    name: "Tekken 8",
    tag: "TK8",
    color: "#8B5CF6",
    cardBg: "#F5F3FF",
    borderColor: "#EDE9FE",
    isActive: true,
    displayOrder: 5,
  },
];

// Clean Empty Tournaments Queue (Only tournaments created via Admin Panel)
export const initialTournaments: TournamentRecord[] = [];

// Clean Empty Registrations Queue (Waiting for real player submissions)
export const initialRegistrations: RegistrationRecord[] = [];

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  gamertag: string;
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  pushToken?: string;
  coins: number;
  winRate: number;
  matchesPlayed: number;
  cupsWon: number;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export const initialUsers: UserRecord[] = [];

export interface LiveMatchRecord {
  id: string;
  title: string;
  stage: string;
  gameType: string;
  team1Name: string;
  team1Tag: string;
  team1Color?: string;
  team2Name: string;
  team2Tag: string;
  team2Color?: string;
  streamUrl: string;
  viewerCount: string;
  isLive: boolean;
  updatedAt?: string;
}

export const initialLiveMatches: LiveMatchRecord[] = [
  {
    id: "live-vs-1",
    title: "Championship • Grand Finals",
    stage: "Map 1: Ascent",
    gameType: "VALORANT",
    team1Name: "Team Nova",
    team1Tag: "NOVA",
    team1Color: "#6366F1",
    team2Name: "Shadow Clan",
    team2Tag: "SHD",
    team2Color: "#FF2E93",
    streamUrl: "https://www.youtube.com",
    viewerCount: "2,450 Watching",
    isLive: true,
    updatedAt: new Date().toISOString(),
  },
];

export const initialLiveMatch: LiveMatchRecord | null = initialLiveMatches[0];

export interface HeroBannerRecord {
  id: string;
  title: string;
  subtitle?: string;
  game: string;
  imageUrl: string;
  ctaColor: string;
  ctaText?: string;
  targetTournamentId?: string;
  targetUrl?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
}

export const initialHeroBanners: HeroBannerRecord[] = [
  {
    id: "banner-val-1",
    title: "Valorant Premier Showdown",
    subtitle: "Weekly 5v5 Championship • Free Entry",
    game: "VALORANT",
    imageUrl: "",
    ctaColor: "#FF2E93",
    ctaText: "Join Tournament",
    targetTournamentId: "",
    isActive: true,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "banner-bgmi-1",
    title: "BGMI Master Series",
    subtitle: "Squad Battle Royale Cup • ₹50,000 Pool",
    game: "BGMI",
    imageUrl: "",
    ctaColor: "#F59E0B",
    ctaText: "Register Squad",
    targetTournamentId: "",
    isActive: true,
    displayOrder: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "banner-tk8-1",
    title: "Tekken 8 Iron Fist Arena",
    subtitle: "1v1 Elimination Showdown",
    game: "TEKKEN 8",
    imageUrl: "",
    ctaColor: "#6366F1",
    ctaText: "Enter Arena",
    targetTournamentId: "",
    isActive: true,
    displayOrder: 3,
    createdAt: new Date().toISOString(),
  },
];

export interface ChampionRecord {
  id: string;
  title: string;
  playerName: string;
  game: string;
  imageUrl: string;
  achievement?: string;
  badgeText?: string;
  badgeColor?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
}

export const initialChampions: ChampionRecord[] = [
  {
    id: "champ-val-1",
    title: "Valorant MVP",
    playerName: "@ViperAce",
    game: "VALORANT",
    imageUrl: "",
    achievement: "₹50,000 Won • Grand MVP",
    badgeText: "#1 MVP",
    badgeColor: "#FF2E93",
    isActive: true,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "champ-bgmi-1",
    title: "BGMI Conqueror",
    playerName: "@SoulMortal",
    game: "BGMI",
    imageUrl: "",
    achievement: "24 Kills • Champion Chicken",
    badgeText: "CONQUEROR",
    badgeColor: "#F59E0B",
    isActive: true,
    displayOrder: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "champ-tk8-1",
    title: "Iron Fist King",
    playerName: "@ArslanAsh",
    game: "TEKKEN 8",
    imageUrl: "",
    achievement: "Undefeated • 12-0 Run",
    badgeText: "KING",
    badgeColor: "#6366F1",
    isActive: true,
    displayOrder: 3,
    createdAt: new Date().toISOString(),
  },
];


