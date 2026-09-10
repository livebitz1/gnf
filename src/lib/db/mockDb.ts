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
  status: "OPEN" | "REGISTRATION_CLOSED" | "LIVE" | "COMPLETED";
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

// Clean Initial Production Databases
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
    id: "live-arena-val",
    title: "Valorant • Semifinals",
    stage: "Map 1: Ascent",
    gameType: "VALORANT",
    team1Name: "Team Nova",
    team1Tag: "NOVA",
    team1Color: "#6366F1",
    team2Name: "Vortex",
    team2Tag: "VTX",
    team2Color: "#FF2E93",
    streamUrl: "https://www.youtube.com",
    viewerCount: "1,420 Watching",
    isLive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "live-arena-bgmi",
    title: "BGMI • Grand Finals",
    stage: "Match 4: Erangel",
    gameType: "BGMI",
    team1Name: "Soul Esports",
    team1Tag: "SOUL",
    team1Color: "#10B981",
    team2Name: "GodLike",
    team2Tag: "GODL",
    team2Color: "#F59E0B",
    streamUrl: "https://www.youtube.com",
    viewerCount: "3,890 Watching",
    isLive: true,
    updatedAt: new Date().toISOString(),
  },
];

export const initialLiveMatch: LiveMatchRecord = initialLiveMatches[0];

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
    id: "banner-val",
    title: "Valorant Premier League",
    subtitle: "Season 4 Finals",
    game: "VALORANT",
    imageUrl: "https://8b4cf30cd85d25da2d64bd3e7f54b74d.r2.cloudflarestorage.com/gamernotfound/valorant_banner.png",
    ctaColor: "#FF2E93",
    ctaText: "Join Tournament",
    isActive: true,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "banner-tekken",
    title: "Tekken 8 Global Battle",
    subtitle: "Iron Fist Showdown",
    game: "TEKKEN",
    imageUrl: "https://8b4cf30cd85d25da2d64bd3e7f54b74d.r2.cloudflarestorage.com/gamernotfound/tekken_banner.png",
    ctaColor: "#6366F1",
    ctaText: "Join Tournament",
    isActive: true,
    displayOrder: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "banner-bgmi",
    title: "BGMI Champion Series",
    subtitle: "Squad Erangel Clash",
    game: "BGMI",
    imageUrl: "https://8b4cf30cd85d25da2d64bd3e7f54b74d.r2.cloudflarestorage.com/gamernotfound/bgmi_banner.png",
    ctaColor: "#F59E0B",
    ctaText: "Join Tournament",
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
    id: "champ-1",
    title: "Valorant Premier MVP",
    playerName: "@ShadowKing",
    game: "VALORANT",
    imageUrl: "https://8b4cf30cd85d25da2d64bd3e7f54b74d.r2.cloudflarestorage.com/gamernotfound/valorant_banner.png",
    achievement: "₹45,000 Won • 88% WR",
    badgeText: "#1 MVP",
    badgeColor: "#F59E0B",
    isActive: true,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "champ-2",
    title: "BGMI Clash Champions",
    playerName: "Team Soul",
    game: "BGMI",
    imageUrl: "https://8b4cf30cd85d25da2d64bd3e7f54b74d.r2.cloudflarestorage.com/gamernotfound/bgmi_banner.png",
    achievement: "₹35,000 Won • 14 Chicken Dinners",
    badgeText: "#1 SQUAD",
    badgeColor: "#FF2E93",
    isActive: true,
    displayOrder: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "champ-3",
    title: "Tekken 8 Master",
    playerName: "@VortexAce",
    game: "TEKKEN 8",
    imageUrl: "https://8b4cf30cd85d25da2d64bd3e7f54b74d.r2.cloudflarestorage.com/gamernotfound/tekken_banner.png",
    achievement: "₹25,000 Won • Undefeated",
    badgeText: "CHAMPION",
    badgeColor: "#6366F1",
    isActive: true,
    displayOrder: 3,
    createdAt: new Date().toISOString(),
  },
];


