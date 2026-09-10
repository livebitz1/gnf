"use client";

import React, { useState } from "react";
import {
  Shield,
  Trophy,
  Users,
  Swords,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Search,
  Filter,
  Plus,
  ChevronRight,
  Database,
  Check,
  Zap,
  Flame,
  Radio,
  Clock,
  Sparkles,
  Layers,
  Settings,
  Edit3,
  ExternalLink,
  Crown,
  Share2,
  Smartphone,
  ShieldCheck,
  SlidersHorizontal,
  Activity,
  Gamepad2,
  Image as ImageIcon,
  Upload,
  Link,
  Menu,
  X,
  LayoutDashboard,
  Server,
} from "lucide-react";
import {
  initialTournaments,
  initialRegistrations,
  initialGames,
  initialLiveMatch,
  initialLiveMatches,
  initialHeroBanners,
  initialChampions,
  RegistrationRecord,
  TournamentRecord,
  GameRecord,
  LiveMatchRecord,
  HeroBannerRecord,
  ChampionRecord,
} from "@/lib/db/mockDb";
import { useEffect, useCallback } from "react";
import { Trash2 } from "lucide-react";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"registrations" | "tournaments" | "games" | "banners" | "champions" | "live">("registrations");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"ALL" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [tournaments, setTournaments] = useState<TournamentRecord[]>(initialTournaments);
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>(initialRegistrations);
  const [games, setGames] = useState<GameRecord[]>(initialGames);
  const [banners, setBanners] = useState<HeroBannerRecord[]>(initialHeroBanners);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(initialHeroBanners[0]?.id || null);
  const [bannerTitle, setBannerTitle] = useState(initialHeroBanners[0]?.title || "Valorant Premier League");
  const [bannerSubtitle, setBannerSubtitle] = useState(initialHeroBanners[0]?.subtitle || "Season 4 Finals");
  const [bannerGame, setBannerGame] = useState(initialHeroBanners[0]?.game || "VALORANT");
  const [bannerImageUrl, setBannerImageUrl] = useState(initialHeroBanners[0]?.imageUrl || "");
  const [bannerCtaColor, setBannerCtaColor] = useState(initialHeroBanners[0]?.ctaColor || "#FF2E93");
  const [bannerCtaText, setBannerCtaText] = useState(initialHeroBanners[0]?.ctaText || "Join Tournament");
  const [bannerTournamentId, setBannerTournamentId] = useState(initialHeroBanners[0]?.targetTournamentId || "");
  const [bannerIsActive, setBannerIsActive] = useState(initialHeroBanners[0]?.isActive ?? true);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isSavingBanner, setIsSavingBanner] = useState(false);
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);

  // Champions 1:1 Cards State
  const [champions, setChampions] = useState<ChampionRecord[]>(initialChampions);
  const [editingChampionId, setEditingChampionId] = useState<string | null>(initialChampions[0]?.id || null);
  const [champTitle, setChampTitle] = useState(initialChampions[0]?.title || "Valorant Premier MVP");
  const [champPlayerName, setChampPlayerName] = useState(initialChampions[0]?.playerName || "@ShadowKing");
  const [champGame, setChampGame] = useState(initialChampions[0]?.game || "VALORANT");
  const [champImageUrl, setChampImageUrl] = useState(initialChampions[0]?.imageUrl || "");
  const [champAchievement, setChampAchievement] = useState(initialChampions[0]?.achievement || "₹45,000 Won • 88% WR");
  const [champBadgeText, setChampBadgeText] = useState(initialChampions[0]?.badgeText || "#1 MVP");
  const [champBadgeColor, setChampBadgeColor] = useState(initialChampions[0]?.badgeColor || "#F59E0B");
  const [champIsActive, setChampIsActive] = useState(initialChampions[0]?.isActive ?? true);
  const [isUploadingChamp, setIsUploadingChamp] = useState(false);
  const [isSavingChamp, setIsSavingChamp] = useState(false);
  const [isDraggingChamp, setIsDraggingChamp] = useState(false);

  const [liveMatches, setLiveMatches] = useState<LiveMatchRecord[]>(initialLiveMatches);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(initialLiveMatches[0]?.id || null);
  const [liveMatch, setLiveMatch] = useState<LiveMatchRecord>(initialLiveMatch);
  const [liveTitle, setLiveTitle] = useState(initialLiveMatch.title);
  const [liveStage, setLiveStage] = useState(initialLiveMatch.stage);
  const [liveGameType, setLiveGameType] = useState(initialLiveMatch.gameType);
  const [liveTeam1Name, setLiveTeam1Name] = useState(initialLiveMatch.team1Name);
  const [liveTeam1Tag, setLiveTeam1Tag] = useState(initialLiveMatch.team1Tag);
  const [liveTeam1Color, setLiveTeam1Color] = useState(initialLiveMatch.team1Color || "#6366F1");
  const [liveTeam2Name, setLiveTeam2Name] = useState(initialLiveMatch.team2Name);
  const [liveTeam2Tag, setLiveTeam2Tag] = useState(initialLiveMatch.team2Tag);
  const [liveTeam2Color, setLiveTeam2Color] = useState(initialLiveMatch.team2Color || "#FF2E93");
  const [liveStreamUrl, setLiveStreamUrl] = useState(initialLiveMatch.streamUrl);
  const [liveViewerCount, setLiveViewerCount] = useState(initialLiveMatch.viewerCount);
  const [liveIsActive, setLiveIsActive] = useState(initialLiveMatch.isLive);
  const [isSavingLive, setIsSavingLive] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  // Add Game Modal
  const [addGameModalOpen, setAddGameModalOpen] = useState(false);
  const [newGameName, setNewGameName] = useState("");
  const [newGameTag, setNewGameTag] = useState("");
  const [newGameColor, setNewGameColor] = useState("#FF2E93");
  const [newGameIsActive, setNewGameIsActive] = useState(true);

  // Inspector & Approval Modal
  const [selectedReg, setSelectedReg] = useState<RegistrationRecord | null>(null);
  const [customRoomId, setCustomRoomId] = useState("");
  const [customRoomPass, setCustomRoomPass] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  // Create Tournament Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newGame, setNewGame] = useState("VALORANT");
  const [newPrize, setNewPrize] = useState("₹50,000");
  const [newEntryFee, setNewEntryFee] = useState("FREE ENTRY");
  const [newSlots, setNewSlots] = useState("32");
  const [newRegion, setNewRegion] = useState("Mumbai (India)");
  const [newTime, setNewTime] = useState("06:00 PM Today");
  const [newFirstPrize, setNewFirstPrize] = useState("");
  const [newSecondPrize, setNewSecondPrize] = useState("");
  const [newThirdPrize, setNewThirdPrize] = useState("");

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3200);
  };

  // Fetch Live Data from Cloudflare Backend APIs
  const fetchAllData = useCallback(async () => {
    try {
      const [tRes, rRes, gRes, lRes, bRes, cRes] = await Promise.all([
        fetch("/api/admin/tournaments"),
        fetch("/api/admin/registrations?status=ALL"),
        fetch("/api/admin/games"),
        fetch("/api/admin/live-match"),
        fetch("/api/admin/banners"),
        fetch("/api/admin/champions"),
      ]);
      const tData = await tRes.json();
      const rData = await rRes.json();
      const gData = await gRes.json();
      const lData = await lRes.json();
      const bData = await bRes.json();
      const cData = await cRes.json();

      if (tData.success && Array.isArray(tData.tournaments)) {
        setTournaments(tData.tournaments);
      }
      if (rData.success && Array.isArray(rData.registrations)) {
        setRegistrations(rData.registrations);
      }
      if (gData.success && Array.isArray(gData.games)) {
        setGames(gData.games);
      }
      if (bData.success && Array.isArray(bData.banners)) {
        setBanners(bData.banners);
      }
      if (cData.success && Array.isArray(cData.champions)) {
        setChampions(cData.champions);
      }
      if (lData.success) {
        if (Array.isArray(lData.liveMatches) && lData.liveMatches.length > 0) {
          setLiveMatches(lData.liveMatches);
          if (lData.liveMatch) {
            setLiveMatch(lData.liveMatch);
          }
        } else if (lData.liveMatch) {
          setLiveMatches([lData.liveMatch]);
          setLiveMatch(lData.liveMatch);
        }
      }
    } catch (err) {
      console.warn("Error synchronizing admin dashboard data:", err);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 3500);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Hero Banners Handlers
  const handleSelectBanner = (b: HeroBannerRecord) => {
    setEditingBannerId(b.id);
    setBannerTitle(b.title);
    setBannerSubtitle(b.subtitle || "");
    setBannerGame(b.game);
    setBannerImageUrl(b.imageUrl);
    setBannerCtaColor(b.ctaColor || "#FF2E93");
    setBannerCtaText(b.ctaText || "Join Tournament");
    setBannerTournamentId(b.targetTournamentId || "");
    setBannerIsActive(b.isActive);
    showToast(`Loaded "${b.title}" for editing`);
  };

  const handleNewBanner = () => {
    setEditingBannerId(null);
    setBannerTitle("Championship Grand Showdown");
    setBannerSubtitle("Weekly Premier League");
    setBannerGame(games[0]?.name || "VALORANT");
    setBannerImageUrl("https://8b4cf30cd85d25da2d64bd3e7f54b74d.r2.cloudflarestorage.com/gamernotfound/new_banner.png");
    setBannerCtaColor("#FF2E93");
    setBannerCtaText("Join Tournament");
    setBannerTournamentId(tournaments[0]?.id || "");
    setBannerIsActive(true);
    showToast("Ready to configure new Hero Banner");
  };

  const uploadBannerFile = async (file: File) => {
    if (!file) return;

    // 1. Immediately read as Base64 Data URL so the user sees their image instantaneously
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setBannerImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);

    setIsUploadingBanner(true);
    showToast(`Uploading ${file.name} to storage server...`);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/banners/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && (data.imageUrl || data.publicUrl || data.dataUrl)) {
        const bestUrl = data.publicUrl || data.imageUrl || data.dataUrl;
        setBannerImageUrl(bestUrl);
        showToast(data.message || "Banner image uploaded and ready!");
      } else {
        showToast("Banner image loaded from file preview");
      }
    } catch (err) {
      console.warn("Upload notice:", err);
      showToast("Loaded image from local file");
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadBannerFile(file);
    }
    // Clear input value so selecting the same file triggers onChange
    e.target.value = "";
  };

  const handleSaveBanner = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingBanner(true);
    const targetId = editingBannerId || `banner-${Date.now()}`;
    const updated: HeroBannerRecord = {
      id: targetId,
      title: bannerTitle.trim() || "Featured Tournament",
      subtitle: bannerSubtitle.trim(),
      game: bannerGame.trim() || "VALORANT",
      imageUrl: bannerImageUrl.trim() || "https://8b4cf30cd85d25da2d64bd3e7f54b74d.r2.cloudflarestorage.com/gamernotfound/valorant_banner.png",
      ctaColor: bannerCtaColor,
      ctaText: bannerCtaText.trim() || "Join Tournament",
      targetTournamentId: bannerTournamentId,
      isActive: bannerIsActive,
      displayOrder: banners.findIndex((b) => b.id === targetId) >= 0 ? banners.find((b) => b.id === targetId)!.displayOrder : banners.length + 1,
      createdAt: new Date().toISOString(),
    };

    setBanners((prev) => {
      const idx = prev.findIndex((b) => b.id === targetId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [...prev, updated];
    });
    setEditingBannerId(targetId);
    showToast(editingBannerId ? "Hero Banner updated successfully!" : "New Hero Banner published to Mobile App!");

    try {
      await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      await fetchAllData();
    } catch (err) {
      console.error("Error saving banner:", err);
    } finally {
      setIsSavingBanner(false);
    }
  };

  const handleDeleteBanner = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this Hero Banner?")) return;

    setBanners((prev) => prev.filter((b) => b.id !== id));
    if (editingBannerId === id) {
      handleNewBanner();
    }
    showToast("Hero Banner deleted");

    try {
      await fetch(`/api/admin/banners?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      await fetchAllData();
    } catch (err) {
      console.error("Error deleting banner:", err);
    }
  };

  const handleToggleBannerActive = async (banner: HeroBannerRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextStatus = !banner.isActive;
    const updated = { ...banner, isActive: nextStatus };
    setBanners((prev) => prev.map((b) => (b.id === banner.id ? updated : b)));
    if (editingBannerId === banner.id) {
      setBannerIsActive(nextStatus);
    }
    showToast(`Banner status: ${nextStatus ? "Active in App" : "Hidden in App"}`);

    try {
      await fetch("/api/admin/banners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: banner.id, isActive: nextStatus }),
      });
      await fetchAllData();
    } catch (err) {
      console.error("Error toggling banner status:", err);
    }
  };

  // Champion Cards (1:1 Ratio) Handlers
  const handleSelectChampion = (c: ChampionRecord) => {
    setEditingChampionId(c.id);
    setChampTitle(c.title);
    setChampPlayerName(c.playerName);
    setChampGame(c.game);
    setChampImageUrl(c.imageUrl);
    setChampAchievement(c.achievement || "");
    setChampBadgeText(c.badgeText || "CHAMPION");
    setChampBadgeColor(c.badgeColor || "#F59E0B");
    setChampIsActive(c.isActive);
    showToast(`Loaded "${c.title}" for editing`);
  };

  const handleNewChampion = () => {
    setEditingChampionId(null);
    setChampTitle("Weekly MVP Champion");
    setChampPlayerName("@PlayerName");
    setChampGame(games[0]?.name || "VALORANT");
    setChampImageUrl("https://8b4cf30cd85d25da2d64bd3e7f54b74d.r2.cloudflarestorage.com/gamernotfound/valorant_banner.png");
    setChampAchievement("₹50,000 Won • Tournament Winner");
    setChampBadgeText("#1 MVP");
    setChampBadgeColor("#F59E0B");
    setChampIsActive(true);
    showToast("Ready to configure new 1:1 Champion Card");
  };

  const uploadChampionFile = async (file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setChampImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);

    setIsUploadingChamp(true);
    showToast(`Uploading ${file.name} (1:1 card)...`);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/champions/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && (data.imageUrl || data.publicUrl || data.dataUrl)) {
        const bestUrl = data.publicUrl || data.imageUrl || data.dataUrl;
        setChampImageUrl(bestUrl);
        showToast("Champion card image uploaded successfully!");
      } else {
        showToast("Champion card image loaded from file preview");
      }
    } catch (err) {
      console.warn("Upload notice:", err);
      showToast("Loaded image from local file");
    } finally {
      setIsUploadingChamp(false);
    }
  };

  const handleChampionFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadChampionFile(file);
    }
    e.target.value = "";
  };

  const handleSaveChampion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingChamp(true);
    const targetId = editingChampionId || `champ-${Date.now()}`;
    const updated: ChampionRecord = {
      id: targetId,
      title: champTitle.trim() || "Weekly Champion",
      playerName: champPlayerName.trim() || "@Champion",
      game: champGame.trim() || "VALORANT",
      imageUrl: champImageUrl.trim() || "https://8b4cf30cd85d25da2d64bd3e7f54b74d.r2.cloudflarestorage.com/gamernotfound/valorant_banner.png",
      achievement: champAchievement.trim(),
      badgeText: champBadgeText.trim() || "CHAMPION",
      badgeColor: champBadgeColor,
      isActive: champIsActive,
      displayOrder: champions.findIndex((c) => c.id === targetId) >= 0 ? champions.find((c) => c.id === targetId)!.displayOrder : champions.length + 1,
      createdAt: new Date().toISOString(),
    };

    setChampions((prev) => {
      const idx = prev.findIndex((c) => c.id === targetId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [...prev, updated];
    });
    setEditingChampionId(targetId);
    showToast(editingChampionId ? "Champion Card updated successfully!" : "New Champion Card published to App!");

    try {
      await fetch("/api/admin/champions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      await fetchAllData();
    } catch (err) {
      console.error("Error saving champion:", err);
    } finally {
      setIsSavingChamp(false);
    }
  };

  const handleDeleteChampion = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this Champion Card?")) return;

    setChampions((prev) => prev.filter((c) => c.id !== id));
    if (editingChampionId === id) {
      handleNewChampion();
    }
    showToast("Champion Card deleted");

    try {
      await fetch(`/api/admin/champions?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      await fetchAllData();
    } catch (err) {
      console.error("Error deleting champion:", err);
    }
  };

  const handleToggleChampionActive = async (champ: ChampionRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextStatus = !champ.isActive;
    const updated = { ...champ, isActive: nextStatus };
    setChampions((prev) => prev.map((c) => (c.id === champ.id ? updated : c)));
    if (editingChampionId === champ.id) {
      setChampIsActive(nextStatus);
    }
    showToast(`Champion card: ${nextStatus ? "Visible in App" : "Hidden in App"}`);

    try {
      await fetch("/api/admin/champions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: champ.id, isActive: nextStatus }),
      });
      await fetchAllData();
    } catch (err) {
      console.error("Error toggling champion status:", err);
    }
  };


  const handleSelectLiveMatch = (m: LiveMatchRecord) => {
    setEditingMatchId(m.id);
    setLiveMatch(m);
    setLiveTitle(m.title);
    setLiveStage(m.stage);
    setLiveGameType(m.gameType);
    setLiveTeam1Name(m.team1Name);
    setLiveTeam1Tag(m.team1Tag);
    setLiveTeam1Color(m.team1Color || "#6366F1");
    setLiveTeam2Name(m.team2Name);
    setLiveTeam2Tag(m.team2Tag);
    setLiveTeam2Color(m.team2Color || "#FF2E93");
    setLiveStreamUrl(m.streamUrl);
    setLiveViewerCount(m.viewerCount);
    setLiveIsActive(m.isLive);
    showToast(`Loaded "${m.title}" for editing`);
  };

  const handleNewLiveMatch = () => {
    setEditingMatchId(null);
    const newCard: LiveMatchRecord = {
      id: `live-vs-${Date.now()}`,
      title: "Championship • Grand Finals",
      stage: "Map 1: Ascent",
      gameType: games[0]?.name || "VALORANT",
      team1Name: "Team Phoenix",
      team1Tag: "PHX",
      team1Color: "#10B981",
      team2Name: "Shadow Clan",
      team2Tag: "SHD",
      team2Color: "#EC4899",
      streamUrl: "https://www.youtube.com",
      viewerCount: "2,450 Watching",
      isLive: true,
      updatedAt: new Date().toISOString(),
    };
    setLiveMatch(newCard);
    setLiveTitle(newCard.title);
    setLiveStage(newCard.stage);
    setLiveGameType(newCard.gameType);
    setLiveTeam1Name(newCard.team1Name);
    setLiveTeam1Tag(newCard.team1Tag);
    setLiveTeam1Color(newCard.team1Color || "#10B981");
    setLiveTeam2Name(newCard.team2Name);
    setLiveTeam2Tag(newCard.team2Tag);
    setLiveTeam2Color(newCard.team2Color || "#EC4899");
    setLiveStreamUrl(newCard.streamUrl);
    setLiveViewerCount(newCard.viewerCount);
    setLiveIsActive(newCard.isLive);
    showToast("Ready to configure new VS Card. Fill details and save.");
  };

  const handleSaveLiveMatch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingLive(true);
    const targetId = editingMatchId || `live-vs-${Date.now()}`;
    const updated: LiveMatchRecord = {
      id: targetId,
      title: liveTitle.trim() || "LIVE • Valorant • Semifinals",
      stage: liveStage.trim() || "Map 1: Ascent",
      gameType: liveGameType.trim() || "VALORANT",
      team1Name: liveTeam1Name.trim() || "Team Nova",
      team1Tag: liveTeam1Tag.trim() || "NOVA",
      team1Color: liveTeam1Color,
      team2Name: liveTeam2Name.trim() || "Vortex",
      team2Tag: liveTeam2Tag.trim() || "VTX",
      team2Color: liveTeam2Color,
      streamUrl: liveStreamUrl.trim() || "https://www.youtube.com",
      viewerCount: liveViewerCount.trim() || "1,420 Watching",
      isLive: liveIsActive,
      updatedAt: new Date().toISOString(),
    };

    setLiveMatch(updated);
    setLiveMatches((prev) => {
      const idx = prev.findIndex((m) => m.id === targetId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [updated, ...prev];
    });
    setEditingMatchId(targetId);
    showToast(editingMatchId ? "Live VS Card updated successfully" : "New Live VS Card published to Mobile App!");

    try {
      await fetch("/api/admin/live-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      await fetchAllData();
    } catch (err) {
      console.error("Error updating live broadcast:", err);
    } finally {
      setIsSavingLive(false);
    }
  };

  const handleDeleteLiveMatch = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this Live VS card?")) return;

    setLiveMatches((prev) => prev.filter((m) => m.id !== id));
    if (editingMatchId === id) {
      handleNewLiveMatch();
    }
    showToast("Live VS card removed from app");

    try {
      await fetch(`/api/admin/live-match?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      await fetchAllData();
    } catch (err) {
      console.error("Error deleting live match:", err);
    }
  };

  const handleToggleLiveStatus = async (match: LiveMatchRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextStatus = !match.isLive;
    const updated: LiveMatchRecord = {
      ...match,
      isLive: nextStatus,
      updatedAt: new Date().toISOString(),
    };

    setLiveMatches((prev) => prev.map((m) => (m.id === match.id ? updated : m)));
    if (editingMatchId === match.id) {
      setLiveIsActive(nextStatus);
      setLiveMatch(updated);
    }
    showToast(`Status changed to: ${nextStatus ? "LIVE IN APP" : "STANDBY / OFFLINE"}`);

    try {
      await fetch("/api/admin/live-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      await fetchAllData();
    } catch (err) {
      console.error("Error toggling live status:", err);
    }
  };


  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchAllData();
    setTimeout(() => {
      setIsRefreshing(false);
      showToast("Live data synchronized");
    }, 600);
  };

  const handleToggleGameActive = async (gameId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    // Optimistic update
    setGames((prev) =>
      prev.map((g) => (g.id === gameId ? { ...g, isActive: nextStatus } : g))
    );
    showToast(`Game status updated: ${nextStatus ? "Active in App" : "Disabled in App"}`);

    try {
      await fetch("/api/admin/games", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: gameId, isActive: nextStatus }),
      });
      await fetchAllData();
    } catch (err) {
      console.error("Error toggling game status:", err);
    }
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameName.trim() || !newGameTag.trim()) return;

    const newG: GameRecord = {
      id: "game-" + Date.now(),
      name: newGameName.trim(),
      tag: newGameTag.trim().toUpperCase(),
      color: newGameColor,
      cardBg: "#F9FAFB",
      borderColor: "#E5E7EB",
      isActive: newGameIsActive,
      displayOrder: games.length + 1,
    };

    setGames((prev) => [...prev, newG]);
    setAddGameModalOpen(false);
    setNewGameName("");
    setNewGameTag("");
    showToast(`Game "${newG.name}" added and synced with App`);

    try {
      await fetch("/api/admin/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newG),
      });
      await fetchAllData();
    } catch (err) {
      console.error("Error creating game:", err);
    }
  };

  const handleDeleteGame = async (gameId: string, gameName: string) => {
    if (!confirm(`Are you sure you want to remove "${gameName}" from games catalog?`)) return;
    setGames((prev) => prev.filter((g) => g.id !== gameId));
    showToast(`Game "${gameName}" removed`);

    try {
      await fetch(`/api/admin/games?id=${gameId}`, { method: "DELETE" });
      await fetchAllData();
    } catch (err) {
      console.error("Error deleting game:", err);
    }
  };

  const handleOpenInspect = (reg: RegistrationRecord) => {
    setSelectedReg(reg);
    setCustomRoomId(reg.roomId || "");
    setCustomRoomPass(reg.roomPass || "");
    setRejectionReason("");
  };

  const handleApprove = async (regId: string) => {
    const trimmedId = customRoomId.trim();
    const trimmedPass = customRoomPass.trim();

    if (!trimmedId || !trimmedPass) {
      showToast("Room ID and Room Password are required before approval.");
      return;
    }

    // 1. Optimistic update
    setRegistrations((prev) =>
      prev.map((r) => {
        if (r.id === regId) {
          return {
            ...r,
            status: "APPROVED",
            roomId: trimmedId,
            roomPass: trimmedPass,
            reviewedAt: "Just now",
            reviewedBy: "GNF_SuperAdmin",
          };
        }
        return r;
      })
    );
    showToast("Slot Approved: Room credentials unlocked in player profile");
    setSelectedReg(null);

    // 2. Commit to Cloudflare D1 Backend
    try {
      await fetch("/api/admin/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: regId,
          status: "APPROVED",
          roomId: trimmedId,
          roomPass: trimmedPass,
          reviewedBy: "GNF_SuperAdmin",
        }),
      });
      await fetchAllData();
    } catch (err) {
      console.error("Failed to persist approval:", err);
    }
  };

  const handleReject = async (regId: string) => {
    // 1. Optimistic update
    const finalReason = rejectionReason || "Roster verification failed / Invalid in-game IDs";
    setRegistrations((prev) =>
      prev.map((r) => {
        if (r.id === regId) {
          return {
            ...r,
            status: "REJECTED",
            rejectionReason: finalReason,
            reviewedAt: "Just now",
            reviewedBy: "GNF_SuperAdmin",
          };
        }
        return r;
      })
    );
    showToast("Registration flagged and rejected");
    setSelectedReg(null);

    // 2. Commit to Cloudflare D1 Backend
    try {
      await fetch("/api/admin/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: regId,
          status: "REJECTED",
          rejectionReason: finalReason,
          reviewedBy: "GNF_SuperAdmin",
        }),
      });
      await fetchAllData();
    } catch (err) {
      console.error("Failed to persist rejection:", err);
    }
  };

  const handleDeleteRegistration = async (regId: string) => {
    if (!confirm("Are you sure you want to delete this squad registration?")) return;

    // 1. Optimistic update
    setRegistrations((prev) => prev.filter((r) => r.id !== regId));
    showToast("Registration deleted successfully");
    if (selectedReg?.id === regId) {
      setSelectedReg(null);
    }

    // 2. Commit to Cloudflare D1 Backend
    try {
      await fetch(`/api/admin/registrations?id=${encodeURIComponent(regId)}`, {
        method: "DELETE",
      });
      await fetchAllData();
    } catch (err) {
      console.error("Failed to delete registration:", err);
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsDeploying(true);
    const prizeNum = parseInt(newPrize.replace(/[^0-9]/g, "")) || 50000;
    const firstP = newFirstPrize.trim() || "₹" + Math.round(prizeNum * 0.5).toLocaleString("en-IN");
    const secondP = newSecondPrize.trim() || "₹" + Math.round(prizeNum * 0.3).toLocaleString("en-IN");
    const thirdP = newThirdPrize.trim() || "₹" + Math.round(prizeNum * 0.2).toLocaleString("en-IN");

    const newT: TournamentRecord = {
      id: "tourney-" + Date.now(),
      title: newTitle.trim(),
      subtitle:
        newGame === "VALORANT"
          ? "5v5 Tactical FPS • Double Elimination"
          : newGame === "BGMI"
          ? "Squad Battle Royale • 4-Player Matches"
          : "1v1 Fighting Game • Best of 3",
      gameType: newGame,
      prizePool: newPrize,
      firstPrize: firstP,
      secondPrize: secondP,
      thirdPrize: thirdP,
      entryFee: newEntryFee.trim() || "FREE ENTRY",
      maxSlots: parseInt(newSlots) || 32,
      filledSlots: 0,
      region: newRegion.trim() || "Mumbai (India)",
      status: "OPEN",
      matchStartTime: newTime || "06:00 PM Today",
    };

    // Optimistically update
    setTournaments((prev) => [newT, ...prev]);
    setCreateModalOpen(false);
    setNewTitle("");

    try {
      const response = await fetch("/api/admin/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newT),
      });
      const data = await response.json();
      if (data.success) {
        showToast("New tournament lobby deployed to App");
        await fetchAllData();
      } else {
        showToast("Tournament deployed to edge state");
      }
    } catch (error) {
      console.error("Error creating tournament:", error);
      showToast("Tournament deployed to local state");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleDeleteTournament = async (tourneyId: string) => {
    if (!confirm("Are you sure you want to delete this tournament lobby?")) return;
    setTournaments((prev) => prev.filter((t) => t.id !== tourneyId));
    try {
      await fetch(`/api/admin/tournaments?id=${tourneyId}`, { method: "DELETE" });
      showToast("Tournament lobby deleted");
      await fetchAllData();
    } catch (err) {
      console.error("Error deleting tournament:", err);
    }
  };

  const filteredRegistrations = registrations.filter((r) => {
    if (selectedGameFilter !== "ALL" && r.gameType !== selectedGameFilter) return false;
    if (selectedStatusFilter !== "ALL" && r.status !== selectedStatusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.teamName.toLowerCase().includes(q) ||
        r.captainIgn.toLowerCase().includes(q) ||
        r.captainGameId.toLowerCase().includes(q) ||
        r.tournamentTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = registrations.filter((r) => r.status === "PENDING_APPROVAL").length;
  const approvedCount = registrations.filter((r) => r.status === "APPROVED").length;

  return (
    <div className="min-h-screen text-slate-100 flex bg-[#060709] font-sans antialiased selection:bg-pink-500/30 selection:text-pink-200">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 glass-panel border border-white/20 px-5 py-3.5 rounded-2xl text-xs font-black shadow-2xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-white tracking-wide">{notification}</span>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ============================================================ */}
      {/* SIDEBAR NAVIGATION (Desktop Sticky & Mobile Drawer) */}
      {/* ============================================================ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0A0C10] border-r border-white/[0.08] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:shrink-0 ${
          isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header: Brand & Live Edge Status */}
        <div className="p-5 border-b border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl glass-icon-btn flex items-center justify-center text-white shadow-lg bg-gradient-to-br from-pink-500/20 to-cyan-500/20 border border-white/15">
                <Zap className="w-5 h-5 text-white fill-white/10" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-black tracking-tight text-white uppercase">GNF Esports</h1>
                </div>
                <p className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">
                  Admin Console
                </p>
              </div>
            </div>
            {/* Mobile close button */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden w-8 h-8 rounded-xl glass-icon-btn flex items-center justify-center text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* System Status Badge */}
          <div className="mt-4 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider">System Live</span>
            </div>
            <span className="text-[9px] font-bold text-zinc-400 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
              Auto Sync Active
            </span>
          </div>
        </div>

        {/* Sidebar Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {/* Group 1: Operations */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              Tournament Operations
            </div>
            <div className="space-y-1">
              {[
                {
                  id: "registrations",
                  label: "Registration Queue",
                  subtitle: "Room IDs & Approvals",
                  count: pendingCount,
                  badgeVariant: pendingCount > 0 ? "amber" : "neutral",
                  icon: Users,
                },
                {
                  id: "tournaments",
                  label: "Tournament Lobbies",
                  subtitle: "Brackets & Prize Pools",
                  count: tournaments.length,
                  badgeVariant: "neutral",
                  icon: Trophy,
                },
                {
                  id: "games",
                  label: "Games Catalog",
                  subtitle: "Titles & Tags Config",
                  count: games.filter((g) => g.isActive).length,
                  countLabel: "Active",
                  badgeVariant: "neutral",
                  icon: Gamepad2,
                },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left transition-all cursor-pointer group ${
                      isActive
                        ? "bg-white text-black shadow-lg shadow-white/10 font-black"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.05] font-bold"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                          isActive
                            ? "bg-black text-white"
                            : "bg-white/[0.06] text-zinc-400 group-hover:text-white group-hover:bg-white/10"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs leading-tight truncate">{item.label}</div>
                        <div
                          className={`text-[10px] leading-tight truncate ${
                            isActive ? "text-zinc-600 font-medium" : "text-zinc-500 font-normal"
                          }`}
                        >
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    {item.count !== undefined && (
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                          isActive
                            ? "bg-black text-white"
                            : item.badgeVariant === "amber" && item.count > 0
                            ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                            : "bg-white/10 text-zinc-300"
                        }`}
                      >
                        {item.count} {item.countLabel || ""}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group 2: Media & Broadcast */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              Broadcast & Media
            </div>
            <div className="space-y-1">
              {[
                {
                  id: "banners",
                  label: "Hero Banners",
                  subtitle: "Home Screen Carousel",
                  badge: `${banners.length} Banners`,
                  icon: ImageIcon,
                },
                {
                  id: "champions",
                  label: "Champion Cards",
                  subtitle: "1:1 Square Cards Hub",
                  badge: `${champions.length} Cards`,
                  icon: Crown,
                },
                {
                  id: "live",
                  label: "Live Match & Stream",
                  subtitle: "Arena VS Cards & Stream",
                  badge: liveMatches.some((m) => m.isLive) ? "LIVE NOW" : "STANDBY",
                  isLiveDot: liveMatches.some((m) => m.isLive),
                  icon: Radio,
                },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left transition-all cursor-pointer group ${
                      isActive
                        ? "bg-white text-black shadow-lg shadow-white/10 font-black"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.05] font-bold"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                          isActive
                            ? "bg-black text-white"
                            : "bg-white/[0.06] text-zinc-400 group-hover:text-white group-hover:bg-white/10"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs leading-tight truncate">{item.label}</div>
                        <div
                          className={`text-[10px] leading-tight truncate ${
                            isActive ? "text-zinc-600 font-medium" : "text-zinc-500 font-normal"
                          }`}
                        >
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 ml-2 flex items-center gap-1.5 ${
                          isActive
                            ? "bg-black text-white"
                            : item.isLiveDot
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-white/10 text-zinc-300"
                        }`}
                      >
                        {item.isLiveDot && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />}
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Footer: Deploy Action, Profile & Edge Sync */}
        <div className="p-3.5 border-t border-white/[0.08] space-y-3 bg-[#08090C]/60">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black py-2.5 rounded-xl text-xs font-black transition-all shadow-xl hover:shadow-white/10 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Deploy Tournament</span>
          </button>

          {/* Admin Profile Box */}
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center text-white font-black text-xs shadow-md">
                SA
              </div>
              <div>
                <div className="text-xs font-black text-white leading-tight">GNF_SuperAdmin</div>
                <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Master Access
                </div>
              </div>
            </div>
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="w-7 h-7 rounded-lg glass-icon-btn flex items-center justify-center text-zinc-400 hover:text-white"
              title="Force Sync"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* RIGHT MAIN WORKSPACE */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Sticky Top Header Bar */}
        <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#08090C]/80 backdrop-blur-2xl px-3 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl glass-icon-btn flex items-center justify-center text-zinc-300 hover:text-white shrink-0 cursor-pointer"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-zinc-500 tracking-wider hidden sm:inline">
                  GNF Console
                </span>
                <span className="text-zinc-600 hidden sm:inline">/</span>
                <h2 className="text-xs sm:text-sm lg:text-base font-black tracking-tight text-white uppercase truncate">
                  {activeTab === "registrations" && "Registration Moderation"}
                  {activeTab === "tournaments" && "Tournament Lobbies"}
                  {activeTab === "games" && "Games Catalog"}
                  {activeTab === "banners" && "Hero Banners Management"}
                  {activeTab === "champions" && "1:1 Champion Cards Hub"}
                  {activeTab === "live" && "Live Match & Arena Stream"}
                </h2>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium hidden md:block truncate">
                {activeTab === "registrations" && "Review rosters, verify captain details, and release confidential room pass"}
                {activeTab === "tournaments" && "Create, schedule, and manage active tournament lobbies deployed to edge"}
                {activeTab === "games" && "Configure supported games, badge styling, and mobile app discovery"}
                {activeTab === "banners" && "Upload, manage, and customize 3:4 hero carousel banners for mobile app"}
                {activeTab === "champions" && "Upload and manage 1:1 aspect ratio square champion cards rendered on the home screen"}
                {activeTab === "live" && "Control real-time Arena VS battle cards and live broadcast stream"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 sm:gap-2 glass-pill hover:bg-white/10 text-zinc-300 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Force Sync Data"
            >
              <RefreshCw className={"w-3.5 h-3.5 " + (isRefreshing ? "animate-spin text-cyan-400" : "text-zinc-400")} />
              <span className="hidden md:inline">Sync Data</span>
            </button>

            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl glass-pill text-xs font-semibold text-zinc-300">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mobile Client Live</span>
            </div>

            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 bg-white hover:bg-zinc-200 text-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-black transition-all shadow-xl hover:shadow-white/10 active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">Deploy Tournament</span>
              <span className="sm:hidden">Deploy</span>
            </button>
          </div>
        </header>

        {/* Main Workspace Body */}
        <main className="p-3.5 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 flex-1 max-w-[1600px] w-full mx-auto">
          {/* KPI Metrics: Glossy 4-Card Deck */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl space-y-2.5 sm:space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[11px] font-black uppercase tracking-wider">Pending Verification</span>
                <div className="w-8 h-8 rounded-xl glass-icon-btn flex items-center justify-center text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">{pendingCount}</span>
                <span className="text-xs font-bold text-amber-400">Teams in Queue</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium leading-tight">
                Waiting for admin approval to release confidential room pass.
              </p>
            </div>

            <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl space-y-2.5 sm:space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[11px] font-black uppercase tracking-wider">Approved Slots</span>
                <div className="w-8 h-8 rounded-xl glass-icon-btn flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">{approvedCount}</span>
                <span className="text-xs font-bold text-emerald-400">Slots Unlocked</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium leading-tight">
                Credentials encrypted and visible in players gamer profile.
              </p>
            </div>

            <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl space-y-2.5 sm:space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[11px] font-black uppercase tracking-wider">Active Cups</span>
                <div className="w-8 h-8 rounded-xl glass-icon-btn flex items-center justify-center text-white">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">{tournaments.length}</span>
                <span className="text-xs font-bold text-zinc-400">Lobbies Live</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium leading-tight">
                VALORANT 5v5, BGMI Squad & TEKKEN 8 1v1.
              </p>
            </div>

            <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl space-y-2.5 sm:space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[11px] font-black uppercase tracking-wider">Active Games</span>
                <div className="w-8 h-8 rounded-xl glass-icon-btn flex items-center justify-center text-indigo-400">
                  <Gamepad2 className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {games.filter((g) => g.isActive).length}
                </span>
                <span className="text-xs font-bold text-indigo-400">Titles Active</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium leading-tight">
                Esports titles available for tournaments and registrations.
              </p>
            </div>
          </div>

        {/* ============================================================ */}
        {/* TAB 1: REGISTRATION MODERATION CONSOLE */}
        {/* ============================================================ */}
        {activeTab === "registrations" && (
          <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-5">
            {/* Filter & Search Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase text-zinc-500 flex items-center gap-1.5 mr-1">
                  <Filter className="w-3.5 h-3.5" /> Filter:
                </span>
                {["ALL", ...Array.from(new Set(games.map((g) => g.name)))].map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGameFilter(g)}
                    className={"px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer " +
                      (selectedGameFilter === g
                        ? "bg-white text-black shadow-md"
                        : "glass-pill text-zinc-400 hover:text-white")}
                  >
                    {g}
                  </button>
                ))}

                <span className="text-zinc-700 mx-1">|</span>

                {(["ALL", "PENDING_APPROVAL", "APPROVED", "REJECTED"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedStatusFilter(s)}
                    className={"px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer " +
                      (selectedStatusFilter === s
                        ? s === "PENDING_APPROVAL"
                          ? "bg-amber-400 text-black"
                          : s === "APPROVED"
                          ? "bg-emerald-400 text-black"
                          : "bg-red-500 text-white"
                        : "glass-pill text-zinc-400 hover:text-white")}
                  >
                    {s === "PENDING_APPROVAL"
                      ? "Pending"
                      : s === "APPROVED"
                      ? "Approved"
                      : s === "REJECTED"
                      ? "Rejected"
                      : "All Status"}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full lg:w-72">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search team, captain, in-game ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="glass-input w-full rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Registrations List Table */}
            <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
              <table className="w-full text-left text-xs min-w-[860px]">
                <thead className="bg-[#08090C] text-zinc-500 uppercase font-black text-[10px] tracking-wider border-b border-white/[0.06]">
                  <tr>
                    <th className="py-3.5 px-4">Game & Tournament</th>
                    <th className="py-3.5 px-4">Squad / Fighter</th>
                    <th className="py-3.5 px-4">Captain In-Game ID</th>
                    <th className="py-3.5 px-4">Emergency Ping</th>
                    <th className="py-3.5 px-4">Room Pass Vault</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Moderation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] font-medium text-zinc-300">
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-500 text-xs font-bold">
                        No registrations matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((reg) => {
                      const isPending = reg.status === "PENDING_APPROVAL";
                      const isApproved = reg.status === "APPROVED";
                      return (
                        <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-2 h-8 rounded-full shrink-0"
                                style={{
                                  backgroundColor:
                                    reg.gameType === "VALORANT"
                                      ? "#FF2E93"
                                      : reg.gameType === "BGMI"
                                      ? "#F59E0B"
                                      : "#6366F1",
                                }}
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-black text-white text-xs">{reg.tournamentTitle}</span>
                                  <span className="text-[9px] font-black uppercase text-zinc-400 bg-white/[0.06] px-1.5 py-0.5 rounded">
                                    {reg.gameType}
                                  </span>
                                </div>
                                <span className="text-[10px] text-zinc-500 font-semibold">{reg.createdAt}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <span className="font-black text-white block">
                              {reg.teamName} {reg.teamTag && "[" + reg.teamTag + "]"}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-semibold">
                              {(reg.roster?.length || 1) + " Roster Members Registered"}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <span className="font-mono text-zinc-200 font-bold block">{reg.captainGameId}</span>
                            <span className="text-[10px] text-zinc-500">{"IGN: " + reg.captainIgn}</span>
                          </td>

                          <td className="py-4 px-4">
                            <span className="font-mono text-[11px] text-zinc-300 bg-black/40 px-2 py-1 rounded-lg border border-white/[0.06] inline-block">
                              {reg.contactHandle}
                            </span>
                            <span className="text-[9px] text-zinc-500 font-bold uppercase block mt-0.5">
                              {reg.contactType}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            {isApproved ? (
                              <div className="space-y-0.5">
                                <span className="font-mono text-xs font-bold text-white block">
                                  {"ID: " + reg.roomId}
                                </span>
                                <span className="font-mono text-[10px] text-zinc-400">
                                  {"Pass: " + reg.roomPass}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-amber-400/80 font-bold flex items-center gap-1">
                                <Lock className="w-3 h-3 text-amber-400" />
                                <span>Locked for Admin Release</span>
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            {isPending && (
                              <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-[10px] font-black">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                Action Required
                              </span>
                            )}
                            {isApproved && (
                              <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-black">
                                <Check className="w-3 h-3" />
                                Unlocked to Profile
                              </span>
                            )}
                            {reg.status === "REJECTED" && (
                              <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full text-[10px] font-black">
                                <XCircle className="w-3 h-3" />
                                Flagged / Rejected
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenInspect(reg)}
                                className={"text-xs font-black px-3.5 py-1.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer shrink-0 " +
                                  (isPending
                                    ? "bg-white text-black hover:bg-zinc-200"
                                    : "glass-icon-btn text-zinc-300 hover:text-white")}
                              >
                                {isPending ? "Review & Unlock Pass →" : "Inspect Roster"}
                              </button>
                              <button
                                onClick={() => handleDeleteRegistration(reg.id)}
                                title="Delete Registration"
                                className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all active:scale-90 cursor-pointer shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: TOURNAMENT LOBBIES */}
        {/* ============================================================ */}
        {activeTab === "tournaments" && (
          <div className="space-y-4">
            {tournaments.length === 0 ? (
              <div className="glass-panel rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center text-zinc-500 space-y-3">
                <Trophy className="w-10 h-10 text-zinc-600 mx-auto" />
                <h4 className="text-white font-black text-sm">No Tournaments Deployed Yet</h4>
                <p className="text-xs">Click Deploy Tournament at the top to publish a new competitive lobby.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {tournaments.map((t) => (
                  <div key={t.id} className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-4 flex flex-col justify-between relative group">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-white px-2.5 py-0.5 rounded-lg bg-white/10 border border-white/15">
                          {t.gameType}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                            {"● " + t.status}
                          </span>
                          <button
                            onClick={() => handleDeleteTournament(t.id)}
                            className="w-6 h-6 rounded-lg glass-icon-btn flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Delete Tournament"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-sm sm:text-base font-black text-white mt-3 leading-snug">{t.title}</h3>
                      <p className="text-xs text-zinc-400 font-medium mt-0.5 leading-relaxed">{t.subtitle}</p>

                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/[0.06] text-center">
                        <div className="bg-black/30 border border-white/[0.05] p-2.5 rounded-2xl">
                          <span className="text-[9px] text-zinc-500 uppercase font-black block">Prize Pool</span>
                          <span className="text-xs font-black text-emerald-400 mt-0.5 block">{t.prizePool}</span>
                        </div>
                        <div className="bg-black/30 border border-white/[0.05] p-2.5 rounded-2xl">
                          <span className="text-[9px] text-zinc-500 uppercase font-black block">Slots Filled</span>
                          <span className="text-xs font-black text-white mt-0.5 block">
                            {Math.max(
                              t.filledSlots || 0,
                              registrations.filter((r) => (r.tournamentId && r.tournamentId === t.id) || r.tournamentTitle === t.title).length
                            ) + " / " + t.maxSlots}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedGameFilter(t.gameType);
                        setActiveTab("registrations");
                      }}
                      className="w-full glass-icon-btn text-white font-black py-2.5 rounded-xl text-xs text-center transition-all cursor-pointer"
                    >
                      View Tournament Registrations &rarr;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: GAMES & CATALOG MANAGEMENT CONSOLE */}
        {/* ============================================================ */}
        {activeTab === "games" && (
          <div className="space-y-6">
            <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Gamepad2 className="w-5 h-5 text-white" />
                  <h3 className="text-base font-black text-white">Esports Games Catalog</h3>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                    {games.filter((g) => g.isActive).length} Active in Mobile App
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-medium mt-1">
                  Enable or disable games instantly, or add new tournament titles. Active games appear in the Mobile App Browse section and filter chips in real time.
                </p>
              </div>

              <button
                onClick={() => setAddGameModalOpen(true)}
                className="flex items-center gap-2 bg-white hover:bg-zinc-200 text-black px-4 py-2.5 rounded-2xl text-xs font-black transition-all shadow-xl hover:shadow-white/10 cursor-pointer active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add New Game</span>
              </button>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {games.map((g) => {
                const liveCount = tournaments.filter((t) => {
                  const gt = (t.gameType || "").toLowerCase();
                  return gt.includes(g.name.toLowerCase()) || gt.includes(g.tag.toLowerCase());
                }).length;

                return (
                  <div
                    key={g.id}
                    className={"glass-card rounded-3xl p-5 space-y-4 flex flex-col justify-between transition-all border " +
                      (g.isActive
                        ? "border-white/15 shadow-lg shadow-black/40"
                        : "border-white/[0.05] opacity-60 bg-black/40")}
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs text-white shadow-md"
                            style={{ backgroundColor: g.color || "#6366F1" }}
                          >
                            {g.tag}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-white">{g.name}</h4>
                            <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
                              Tag: {g.tag}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteGame(g.id, g.name)}
                          className="w-7 h-7 rounded-xl glass-icon-btn flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete Game"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Stats & Theme */}
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/[0.06] text-center">
                        <div className="bg-black/30 border border-white/[0.05] p-2.5 rounded-2xl">
                          <span className="text-[9px] text-zinc-500 uppercase font-black block">Live Lobbies</span>
                          <span className="text-xs font-black text-white mt-0.5 block">
                            {liveCount} {liveCount === 1 ? "Lobby" : "Lobbies"}
                          </span>
                        </div>
                        <div className="bg-black/30 border border-white/[0.05] p-2.5 rounded-2xl flex flex-col items-center justify-center">
                          <span className="text-[9px] text-zinc-500 uppercase font-black block">Theme Color</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }} />
                            <span className="text-[10px] font-mono font-bold text-zinc-300">{g.color}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Toggle Switch CTA */}
                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={"w-2 h-2 rounded-full " +
                            (g.isActive ? "bg-emerald-400 animate-pulse" : "bg-zinc-600")}
                        />
                        <span
                          className={"text-xs font-black " +
                            (g.isActive ? "text-emerald-400" : "text-zinc-500")}
                        >
                          {g.isActive ? "Active in App" : "Disabled / Hidden"}
                        </span>
                      </div>

                      <button
                        onClick={() => handleToggleGameActive(g.id, g.isActive)}
                        className={"px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer " +
                          (g.isActive
                            ? "bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40"
                            : "bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40")}
                      >
                        {g.isActive ? "Disable in App" : "Enable in App"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB: HERO SECTION BANNERS MANAGEMENT */}
        {/* ============================================================ */}
        {activeTab === "banners" && (
          <div className="space-y-6">
            <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Header & Quick Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-white/[0.08] pb-4 sm:pb-5">
                <div>
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-pink-500" />
                      Hero Carousel Banner Manager
                    </h3>
                    <span className="text-[11px] font-black bg-pink-500/20 text-pink-300 border border-pink-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                      <Smartphone className="w-3 h-3 text-pink-400" />
                      3:4 Mobile Carousel
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-medium mt-1">
                    Manage 3:4 hero banners and tournament action buttons on the mobile home screen. Upload artwork directly to customize the app carousel.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={handleNewBanner}
                    className="px-4 py-2 sm:py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-black rounded-xl flex items-center gap-2 shadow-lg shadow-pink-600/20 cursor-pointer active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Hero Banner</span>
                  </button>
                </div>
              </div>

              {/* Grid of Existing Banners */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                  <span className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-zinc-400" />
                    Configured Hero Banners ({banners.length})
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Click any banner to edit its artwork, CTA color, or linked tournament
                  </span>
                </div>

                {banners.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl bg-black/20">
                    <ImageIcon className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                    <p className="text-xs font-bold text-zinc-400">No hero banners configured yet.</p>
                    <button
                      onClick={handleNewBanner}
                      className="mt-3 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl"
                    >
                      + Create First Hero Banner
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
                    {banners.map((b) => {
                      const isSelected = editingBannerId === b.id;
                      const linkedTourney = tournaments.find((t) => t.id === b.targetTournamentId);
                      return (
                        <div
                          key={b.id}
                          onClick={() => handleSelectBanner(b)}
                          className={`rounded-2xl border p-3.5 transition-all cursor-pointer relative space-y-3 ${
                            isSelected
                              ? "bg-white/[0.08] border-pink-500/70 shadow-xl shadow-pink-500/10"
                              : "bg-black/30 border-white/[0.06] hover:bg-white/[0.04] hover:border-white/15"
                          }`}
                        >
                          {/* Banner Image Preview Aspect 3:4 */}
                          <div className="aspect-[3/4] w-full bg-black/60 rounded-xl overflow-hidden border border-white/10 relative group">
                            {b.imageUrl ? (
                              <img
                                src={b.imageUrl}
                                alt={b.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  // Fallback placeholder
                                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 p-4 text-center">
                                <ImageIcon className="w-8 h-8 mb-2" />
                                <span className="text-[10px] font-bold">No Image Set</span>
                              </div>
                            )}

                            {/* Top Badges overlay */}
                            <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                              <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-md bg-black/80 text-white backdrop-blur-md border border-white/10">
                                {b.game}
                              </span>
                              <span
                                className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                                  b.isActive
                                    ? "bg-emerald-500/90 text-white shadow-sm"
                                    : "bg-zinc-800/90 text-zinc-400"
                                }`}
                              >
                                {b.isActive ? "ACTIVE" : "HIDDEN"}
                              </span>
                            </div>

                            {/* Bottom simulated CTA on thumbnail */}
                            <div className="absolute bottom-2 left-2 right-2">
                              <div
                                className="w-full py-1.5 rounded-lg text-[10px] font-black text-white text-center shadow-lg truncate px-2"
                                style={{ backgroundColor: b.ctaColor || "#FF2E93" }}
                              >
                                {b.ctaText || "Join Tournament"}
                              </div>
                            </div>
                          </div>

                          {/* Info & Actions */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-black text-white truncate flex-1">{b.title}</h4>
                              <button
                                onClick={(e) => handleDeleteBanner(b.id, e)}
                                className="w-6 h-6 rounded-lg flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 ml-1"
                                title="Delete Banner"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {b.subtitle && (
                              <p className="text-[10px] text-zinc-400 truncate">{b.subtitle}</p>
                            )}
                            <div className="flex items-center justify-between pt-1 border-t border-white/[0.05] text-[10px]">
                              <span className="text-zinc-500 truncate">
                                {linkedTourney ? `Linked: ${linkedTourney.title}` : `Auto: ${b.game} Tournaments`}
                              </span>
                              <button
                                onClick={(e) => handleToggleBannerActive(b, e)}
                                className={`font-bold text-[9px] px-1.5 py-0.5 rounded transition-all ${
                                  b.isActive ? "text-emerald-400 hover:text-emerald-300" : "text-zinc-500 hover:text-zinc-300"
                                }`}
                              >
                                {b.isActive ? "Active" : "Enable"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Editor & Real-time Mobile Preview Section */}
              <div className="border-t border-white/[0.08] pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-pink-500" />
                      {editingBannerId ? "Edit Hero Banner" : "Configure New Hero Banner"}
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Upload banner artwork (3:4 ratio) and customize the Join button.
                    </p>
                  </div>
                  {editingBannerId && (
                    <button
                      onClick={handleNewBanner}
                      className="text-xs text-pink-400 hover:text-pink-300 font-bold underline cursor-pointer"
                    >
                      Switch to + New Banner
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Mobile 3:4 Hero Simulator Preview */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-2">
                        <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                        Mobile Hero Card Preview
                      </span>
                      <span className="text-[10px] font-bold text-zinc-500">Live 3:4 Simulator</span>
                    </div>

                    {/* Simulated Mobile Card Container */}
                    <div className="relative rounded-3xl p-4 border border-white/15 bg-gradient-to-b from-[#161820] to-[#0A0B0E] shadow-2xl space-y-3">
                      {/* Artwork Box */}
                      <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden relative bg-black/80 border border-white/10 shadow-inner flex items-center justify-center">
                        {bannerImageUrl ? (
                          <img
                            src={bannerImageUrl}
                            alt={bannerTitle}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80";
                            }}
                          />
                        ) : (
                          <div className="text-center p-6 text-zinc-500">
                            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-xs font-bold">No Artwork Uploaded</p>
                            <p className="text-[10px]">Upload banner artwork below</p>
                          </div>
                        )}

                        {/* Top Game Tag */}
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-[10px] font-black text-white uppercase tracking-wider">
                            {bannerGame}
                          </span>
                        </div>
                      </div>

                      {/* Simulated Join Tournament CTA */}
                      <div>
                        <button
                          type="button"
                          className="w-full py-3 rounded-2xl text-xs font-black text-white uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-default"
                          style={{ backgroundColor: bannerCtaColor }}
                        >
                          <Trophy className="w-3.5 h-3.5" />
                          <span>{bannerCtaText || "Join Tournament"}</span>
                        </button>
                      </div>

                      {/* Dot Pagination Simulation */}
                      <div className="flex items-center justify-center gap-1.5 pt-1">
                        <div className="w-6 h-1.5 rounded-full" style={{ backgroundColor: bannerCtaColor }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      </div>
                    </div>
                  </div>

                  {/* Right: Banner Settings & Upload Form */}
                  <div className="lg:col-span-7">
                    <form onSubmit={handleSaveBanner} className="space-y-4">
                      {/* Presets Bar */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase shrink-0">Quick Presets:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setBannerTitle("Valorant Premier League");
                            setBannerSubtitle("Season 4 Finals");
                            setBannerGame("VALORANT");
                            setBannerCtaColor("#FF2E93");
                            setBannerImageUrl("https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold border border-white/10 transition-all shrink-0"
                        >
                          Valorant
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBannerTitle("Tekken 8 Global Battle");
                            setBannerSubtitle("Iron Fist Showdown");
                            setBannerGame("TEKKEN");
                            setBannerCtaColor("#6366F1");
                            setBannerImageUrl("https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold border border-white/10 transition-all shrink-0"
                        >
                          Tekken 8
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBannerTitle("BGMI Champion Series");
                            setBannerSubtitle("Squad Erangel Clash");
                            setBannerGame("BGMI");
                            setBannerCtaColor("#F59E0B");
                            setBannerImageUrl("https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold border border-white/10 transition-all shrink-0"
                        >
                          BGMI
                        </button>
                      </div>

                      {/* Banner Artwork Upload Box */}
                      <div className="bg-black/30 border border-white/10 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase text-pink-400 tracking-wider flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5" />
                            Banner Artwork Upload (3:4 Ratio)
                          </label>
                          <span className="text-[10px] font-mono text-zinc-400">
                            3:4 Ratio Recommended
                          </span>
                        </div>

                        {/* Drag and Drop Zone */}
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingBanner(true);
                          }}
                          onDragLeave={() => setIsDraggingBanner(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingBanner(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) {
                              uploadBannerFile(file);
                            }
                          }}
                          className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all text-center cursor-pointer ${
                            isDraggingBanner
                              ? "border-pink-500 bg-pink-500/10 scale-[1.01]"
                              : "border-white/20 hover:border-pink-400 bg-white/[0.02] hover:bg-white/[0.05]"
                          }`}
                        >
                          <label className="w-full h-full flex flex-col items-center justify-center gap-1.5 cursor-pointer">
                            <div className="w-10 h-10 rounded-xl glass-icon-btn flex items-center justify-center text-pink-400 mb-1 shadow-md">
                              <Upload className={`w-5 h-5 ${isUploadingBanner ? "animate-bounce" : ""}`} />
                            </div>
                            <span className="text-xs font-black text-white">
                              {isUploadingBanner ? "Uploading banner image..." : "Click or Drag & Drop Banner Artwork Here"}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              Supports PNG, JPG, WebP, SVG • Auto optimized for 3:4 Mobile Carousel
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              disabled={isUploadingBanner}
                              className="hidden"
                            />
                          </label>
                        </div>

                        <div>
                          <label className="text-[9px] text-zinc-400 uppercase font-bold block mb-1">
                            Direct Image URL / Asset Link
                          </label>
                          <input
                            type="text"
                            value={bannerImageUrl}
                            onChange={(e) => setBannerImageUrl(e.target.value)}
                            placeholder="https://... or /uploads/banners/..."
                            className="glass-input w-full rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                            Banner Title *
                          </label>
                          <input
                            type="text"
                            value={bannerTitle}
                            onChange={(e) => setBannerTitle(e.target.value)}
                            placeholder="e.g. Valorant Premier League"
                            className="glass-input w-full rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                            Subtitle / Tournament Tagline
                          </label>
                          <input
                            type="text"
                            value={bannerSubtitle}
                            onChange={(e) => setBannerSubtitle(e.target.value)}
                            placeholder="e.g. Season 4 Finals • ₹50,000"
                            className="glass-input w-full rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                            Game Category
                          </label>
                          <select
                            value={bannerGame}
                            onChange={(e) => setBannerGame(e.target.value)}
                            className="glass-input w-full rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                          >
                            {games.map((g) => (
                              <option key={g.id} value={g.name} className="bg-black text-white">
                                {g.name} ({g.tag})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                            Link to Tournament
                          </label>
                          <select
                            value={bannerTournamentId}
                            onChange={(e) => setBannerTournamentId(e.target.value)}
                            className="glass-input w-full rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                          >
                            <option value="" className="bg-black text-zinc-400">
                              Auto (Open highest prize {bannerGame} lobby)
                            </option>
                            {tournaments.map((t) => (
                              <option key={t.id} value={t.id} className="bg-black text-white">
                                {t.title} ({t.gameType} • {t.prizePool})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* CTA Color & Text */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/[0.08]">
                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                            CTA Button Text
                          </label>
                          <input
                            type="text"
                            value={bannerCtaText}
                            onChange={(e) => setBannerCtaText(e.target.value)}
                            placeholder="Join Tournament"
                            className="glass-input w-full rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                            CTA Button Color Theme
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={bannerCtaColor}
                              onChange={(e) => setBannerCtaColor(e.target.value)}
                              className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer"
                            />
                            <div className="flex items-center gap-1.5 flex-1">
                              {["#FF2E93", "#6366F1", "#F59E0B", "#10B981", "#8B5CF6"].map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => setBannerCtaColor(c)}
                                  className={`w-6 h-6 rounded-lg transition-transform ${
                                    bannerCtaColor === c ? "scale-110 ring-2 ring-white" : ""
                                  }`}
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Active Switch & Save */}
                      <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={bannerIsActive}
                            onChange={(e) => setBannerIsActive(e.target.checked)}
                            className="w-5 h-5 accent-pink-500 rounded cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-black text-white block">Active on Mobile App</span>
                            <span className="text-[10px] text-zinc-400 block">Show this hero banner in the top carousel for all players</span>
                          </div>
                        </label>

                        <button
                          type="submit"
                          disabled={isSavingBanner}
                          className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-zinc-200 text-black font-black rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-xl hover:shadow-white/10 cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          {isSavingBanner ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Saving Banner...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>{editingBannerId ? "Save & Update Banner" : "Publish New Hero Banner"}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB: 1:1 CHAMPION CARDS MANAGEMENT */}
        {/* ============================================================ */}
        {activeTab === "champions" && (
          <div className="space-y-6">
            <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Header & Quick Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-white/[0.08] pb-4 sm:pb-5">
                <div>
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                      <Crown className="w-5 h-5 text-amber-400" />
                      1:1 Champion Cards Hub
                    </h3>
                    <span className="text-[11px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                      <Smartphone className="w-3 h-3 text-amber-400" />
                      1:1 Square Mobile Cards
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-medium mt-1">
                    Upload and manage 1:1 aspect ratio square champion cards. Uploaded cards will render directly in the Hall of Champions on the mobile app home screen.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={handleNewChampion}
                    className="px-4 py-2 sm:py-2.5 bg-gradient-to-r from-amber-500 to-pink-600 hover:from-amber-400 hover:to-pink-500 text-white text-xs font-black rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Champion Card</span>
                  </button>
                </div>
              </div>

              {/* Grid of Existing Champion Cards */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                  <span className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-zinc-400" />
                    Configured Champion Cards ({champions.length})
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Click any card to edit its 1:1 artwork, player info, badge, or achievements
                  </span>
                </div>

                {champions.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl bg-black/20">
                    <Crown className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                    <p className="text-xs font-bold text-zinc-400">No champion cards uploaded yet.</p>
                    <button
                      onClick={handleNewChampion}
                      className="mt-3 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl"
                    >
                      + Create First Champion Card
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
                    {champions.map((c) => {
                      const isSelected = editingChampionId === c.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => handleSelectChampion(c)}
                          className={`rounded-2xl border p-3.5 transition-all cursor-pointer relative space-y-3 ${
                            isSelected
                              ? "bg-white/[0.08] border-amber-400/70 shadow-xl shadow-amber-400/10"
                              : "bg-black/30 border-white/[0.06] hover:bg-white/[0.04] hover:border-white/15"
                          }`}
                        >
                          {/* 1:1 Aspect Ratio Preview */}
                          <div className="aspect-square w-full bg-black/60 rounded-xl overflow-hidden border border-white/10 relative group">
                            {c.imageUrl ? (
                              <img
                                src={c.imageUrl}
                                alt={c.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 p-4 text-center">
                                <Crown className="w-8 h-8 mb-2 text-amber-500" />
                                <span className="text-[10px] font-bold">No 1:1 Image</span>
                              </div>
                            )}

                            {/* Top Badges overlay */}
                            <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                              <span
                                className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md text-black shadow-md"
                                style={{ backgroundColor: c.badgeColor || "#F59E0B" }}
                              >
                                {c.badgeText || "CHAMPION"}
                              </span>
                              <span
                                className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                                  c.isActive
                                    ? "bg-emerald-500/90 text-white shadow-sm"
                                    : "bg-zinc-800/90 text-zinc-400"
                                }`}
                              >
                                {c.isActive ? "ACTIVE" : "HIDDEN"}
                              </span>
                            </div>

                            {/* Bottom info vignette overlay on thumbnail */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2.5 pt-6 pointer-events-none">
                              <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                                {c.game}
                              </span>
                              <h5 className="text-xs font-black text-white truncate drop-shadow-md">
                                {c.playerName}
                              </h5>
                              {c.achievement && (
                                <p className="text-[10px] text-zinc-300 font-medium truncate mt-0.5">
                                  {c.achievement}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Card Info & Actions */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-black text-white truncate flex-1">{c.title}</h4>
                              <button
                                onClick={(e) => handleDeleteChampion(c.id, e)}
                                className="w-6 h-6 rounded-lg flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 ml-1"
                                title="Delete Champion Card"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-white/[0.05] text-[10px]">
                              <span className="text-zinc-400 truncate">
                                {c.playerName} • {c.game}
                              </span>
                              <button
                                onClick={(e) => handleToggleChampionActive(c, e)}
                                className={`font-bold text-[9px] px-1.5 py-0.5 rounded transition-all ${
                                  c.isActive ? "text-emerald-400 hover:text-emerald-300" : "text-zinc-500 hover:text-zinc-300"
                                }`}
                              >
                                {c.isActive ? "Active" : "Enable"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Editor & Real-time 1:1 Square Mobile Preview Section */}
              <div className="border-t border-white/[0.08] pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      {editingChampionId ? "Edit Champion Card" : "Upload New 1:1 Champion Card"}
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Upload 1:1 square artwork and configure player details rendered directly in the mobile app.
                    </p>
                  </div>
                  {editingChampionId && (
                    <button
                      onClick={handleNewChampion}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                    >
                      Switch to + New Champion Card
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left: 1:1 Mobile Card Visual Preview */}
                  <div className="lg:col-span-4 space-y-3">
                    <span className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-zinc-400" />
                      1:1 Mobile Card Live Simulation
                    </span>

                    {/* 1:1 Aspect Ratio Card Preview */}
                    <div className="relative mx-auto w-full max-w-[280px] aspect-square rounded-[22px] overflow-hidden border-2 border-white/20 shadow-2xl bg-zinc-950 flex flex-col justify-between p-3.5 group select-none">
                      {/* Background 1:1 Image */}
                      {champImageUrl ? (
                        <img
                          src={champImageUrl}
                          alt="Champion Preview"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black flex flex-col items-center justify-center text-zinc-600 p-4 text-center">
                          <Crown className="w-12 h-12 text-amber-500/40 mb-2" />
                          <span className="text-xs font-bold text-zinc-500">Upload 1:1 Image</span>
                        </div>
                      )}

                      {/* Top Badges Row */}
                      <div className="relative z-10 flex items-center justify-between">
                        <div
                          className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase shadow-lg text-black tracking-tight"
                          style={{ backgroundColor: champBadgeColor || "#F59E0B" }}
                        >
                          {champBadgeText || "CHAMPION"}
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-black/75 text-white backdrop-blur-md border border-white/20">
                          {champGame}
                        </span>
                      </div>

                      {/* Dark Vignette Bottom Gradient */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent pt-16 pb-3 px-3.5 z-10">
                        <span className="text-[10px] font-bold text-amber-400 tracking-wide uppercase block">
                          {champTitle || "Tournament MVP"}
                        </span>
                        <h4 className="text-base font-black text-white tracking-tight drop-shadow-md truncate">
                          {champPlayerName || "@ShadowKing"}
                        </h4>
                        {champAchievement && (
                          <p className="text-[11px] font-semibold text-zinc-300 truncate mt-0.5">
                            ⚡ {champAchievement}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Native 1:1 Ratio • Rendered in Mobile Hall of Champions
                      </span>
                    </div>
                  </div>

                  {/* Right: Champion Card Form */}
                  <div className="lg:col-span-8 space-y-5">
                    <form onSubmit={handleSaveChampion} className="space-y-4">
                      {/* 1:1 Image Upload Zone */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-white flex items-center justify-between">
                          <span>Champion Card Image (1:1 Ratio)</span>
                          <span className="text-[11px] text-amber-400 font-normal">
                            Direct R2 &amp; Local CDN Upload
                          </span>
                        </label>

                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingChamp(true);
                          }}
                          onDragLeave={() => setIsDraggingChamp(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingChamp(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) uploadChampionFile(file);
                          }}
                          className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer ${
                            isDraggingChamp
                              ? "border-amber-400 bg-amber-400/10"
                              : "border-white/15 bg-black/20 hover:border-white/30 hover:bg-black/30"
                          }`}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleChampionFileUpload}
                            className="hidden"
                            id="champ-image-upload"
                          />
                          <label htmlFor="champ-image-upload" className="cursor-pointer block">
                            <Upload className="w-7 h-7 text-amber-400 mx-auto mb-2" />
                            <p className="text-xs font-black text-white">
                              {isUploadingChamp ? "Uploading 1:1 Card Image..." : "Click to upload 1:1 Card or Drag & Drop"}
                            </p>
                            <p className="text-[11px] text-zinc-400 mt-1">
                              PNG, JPG, WEBP • Recommended 1:1 Square (e.g. 800x800)
                            </p>
                          </label>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-zinc-400 font-bold shrink-0">Or Image URL:</span>
                          <input
                            type="text"
                            value={champImageUrl}
                            onChange={(e) => setChampImageUrl(e.target.value)}
                            placeholder="https://... or /uploads/champions/..."
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      {/* Title & Player Gamertag */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-white">Card / Tournament Title</label>
                          <input
                            type="text"
                            value={champTitle}
                            onChange={(e) => setChampTitle(e.target.value)}
                            placeholder="e.g. Valorant Premier MVP"
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-white">Player / Team Name</label>
                          <input
                            type="text"
                            value={champPlayerName}
                            onChange={(e) => setChampPlayerName(e.target.value)}
                            placeholder="e.g. @ShadowKing or Team Soul"
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      {/* Game & Achievement */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-white">Game Category</label>
                          <select
                            value={champGame}
                            onChange={(e) => setChampGame(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                          >
                            {games.map((g) => (
                              <option key={g.id} value={g.name} className="bg-zinc-900 text-white">
                                {g.name} ({g.tag})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-white">Achievement / Prize Won</label>
                          <input
                            type="text"
                            value={champAchievement}
                            onChange={(e) => setChampAchievement(e.target.value)}
                            placeholder="e.g. ₹45,000 Won • 88% WR"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      {/* Badge Text & Color Picker */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-white">Badge Tag Text</label>
                          <input
                            type="text"
                            value={champBadgeText}
                            onChange={(e) => setChampBadgeText(e.target.value)}
                            placeholder="e.g. #1 MVP, GOLD CHAMPION"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-white">Badge Color Preset</label>
                          <div className="flex items-center gap-2 pt-1">
                            {[
                              { label: "Gold", color: "#F59E0B" },
                              { label: "Hot Pink", color: "#FF2E93" },
                              { label: "Indigo", color: "#6366F1" },
                              { label: "Emerald", color: "#10B981" },
                              { label: "Cyan", color: "#06B6D4" },
                            ].map((c) => (
                              <button
                                key={c.color}
                                type="button"
                                onClick={() => setChampBadgeColor(c.color)}
                                className={`w-8 h-8 rounded-xl border-2 transition-all cursor-pointer ${
                                  champBadgeColor === c.color ? "border-white scale-110 shadow-lg" : "border-transparent opacity-80"
                                }`}
                                style={{ backgroundColor: c.color }}
                                title={c.label}
                              />
                            ))}
                            <input
                              type="color"
                              value={champBadgeColor}
                              onChange={(e) => setChampBadgeColor(e.target.value)}
                              className="w-8 h-8 rounded-xl bg-transparent border-0 cursor-pointer p-0 ml-1"
                              title="Custom Color"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Active Switch & Save */}
                      <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={champIsActive}
                            onChange={(e) => setChampIsActive(e.target.checked)}
                            className="w-5 h-5 accent-amber-400 rounded cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-black text-white block">Active on Mobile App</span>
                            <span className="text-[10px] text-zinc-400 block">Render this 1:1 champion card in the home screen Hall of Champions</span>
                          </div>
                        </label>

                        <button
                          type="submit"
                          disabled={isSavingChamp}
                          className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-zinc-200 text-black font-black rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-xl hover:shadow-white/10 cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          {isSavingChamp ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Saving Champion Card...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>{editingChampionId ? "Save & Update Card" : "Publish 1:1 Champion Card"}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB: LIVE BROADCAST & STREAM MANAGEMENT */}
        {/* ============================================================ */}
        {activeTab === "live" && (
          <div className="space-y-6">
            {/* 1. Header & Live Cards Manager Bar */}
            <div className="glass-panel rounded-3xl p-4 sm:p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                      Live Arena Stream &amp; VS Cards Manager
                    </h3>
                    <span className="text-[11px] font-black bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full">
                      {liveMatches.filter((m) => m.isLive).length} Live / {liveMatches.length} Total Cards
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-medium mt-1">
                    Manage &ldquo;Live in Arena Now&rdquo; VS cards shown on the mobile app. Users scroll horizontally through all live matches in real time.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleNewLiveMatch}
                    className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 cursor-pointer active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Create New VS Card</span>
                  </button>
                </div>
              </div>

              {/* 2. Grid of All Live VS Match Cards */}
              <div>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <span className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-zinc-400" />
                    Configured VS Cards ({liveMatches.length})
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Click any card to edit its details below
                  </span>
                </div>

                {liveMatches.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl bg-black/20">
                    <Radio className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                    <p className="text-xs font-bold text-zinc-400">No live match cards created yet.</p>
                    <button
                      onClick={handleNewLiveMatch}
                      className="mt-3 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl"
                    >
                      + Create First Live VS Card
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                    {liveMatches.map((m) => {
                      const isSelected = editingMatchId === m.id;
                      return (
                        <div
                          key={m.id}
                          onClick={() => handleSelectLiveMatch(m)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer relative space-y-3 ${
                            isSelected
                              ? "bg-white/[0.08] border-red-500/60 shadow-xl shadow-red-500/10"
                              : "bg-black/30 border-white/[0.06] hover:bg-white/[0.04] hover:border-white/15"
                          }`}
                        >
                          {/* Top Row: Game + Live Status + Delete Button */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                                  m.isLive
                                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                    : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${m.isLive ? "bg-red-500 animate-pulse" : "bg-zinc-500"}`} />
                                {m.isLive ? "LIVE" : "STANDBY"}
                              </span>
                              <span className="text-[10px] font-mono font-black text-zinc-300 uppercase">
                                {m.gameType}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              {isSelected && (
                                <span className="text-[9px] font-black bg-white/20 text-white px-2 py-0.5 rounded-md">
                                  EDITING
                                </span>
                              )}
                              <button
                                onClick={(e) => handleDeleteLiveMatch(m.id, e)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Delete VS Card"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Match Title & Map */}
                          <div>
                            <h4 className="text-xs font-black text-white truncate">{m.title}</h4>
                            <p className="text-[10px] text-zinc-400 truncate">{m.stage}</p>
                          </div>

                          {/* VS Matchup row */}
                          <div className="bg-black/40 border border-white/[0.06] rounded-xl p-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-sm"
                                style={{ backgroundColor: m.team1Color || "#6366F1" }}
                              >
                                {m.team1Tag || "T1"}
                              </div>
                              <span className="text-[11px] font-bold text-white truncate">{m.team1Name}</span>
                            </div>

                            <div className="px-2 py-0.5 bg-white/10 rounded-lg text-[10px] font-black italic text-zinc-300 mx-1.5 shrink-0">
                              VS
                            </div>

                            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end text-right">
                              <span className="text-[11px] font-bold text-white truncate">{m.team2Name}</span>
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-sm"
                                style={{ backgroundColor: m.team2Color || "#FF2E93" }}
                              >
                                {m.team2Tag || "T2"}
                              </div>
                            </div>
                          </div>

                          {/* Bottom Row: Viewers, Stream link test & quick toggle */}
                          <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-400 border-t border-white/[0.05]">
                            <span className="truncate">{m.viewerCount || "1.4K watching"}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => handleToggleLiveStatus(m, e)}
                                className={`px-2 py-0.5 rounded-md font-bold text-[9px] transition-all ${
                                  m.isLive
                                    ? "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                                    : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                                }`}
                              >
                                {m.isLive ? "Set Offline" : "Set Live"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. Editor & Real-time Mobile Preview Section */}
              <div className="border-t border-white/[0.08] pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-pink-500" />
                      {editingMatchId ? "Edit VS Card Details" : "Create New VS Card"}
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Configure teams, colors, live stream destination URL, and view instant preview.
                    </p>
                  </div>
                  {editingMatchId && (
                    <button
                      onClick={handleNewLiveMatch}
                      className="text-xs text-pink-400 hover:text-pink-300 font-bold underline cursor-pointer"
                    >
                      Switch to + New Card
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
                  {/* Left: Mobile Simulator Preview */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-2">
                        <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                        Live Mobile Card Preview
                      </span>
                      <span className="text-[10px] font-bold text-zinc-500">Real-time Visual</span>
                    </div>

                    {/* Simulated Mobile Card */}
                    <div className="relative rounded-3xl p-4 sm:p-5 border border-white/15 bg-gradient-to-b from-[#161820] to-[#0A0B0E] overflow-hidden shadow-2xl space-y-4">
                      {/* Background glow */}
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

                      {/* Top Row: Live Badge, Title, Stage */}
                      <div className="flex items-start justify-between relative z-10">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                              LIVE
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-300">
                              {liveGameType}
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-white">{liveTitle}</h4>
                          <p className="text-[11px] text-zinc-400 font-medium">{liveStage}</p>
                        </div>
                      </div>

                      {/* VS Matchup Arena Display */}
                      <div className="relative z-10 bg-black/40 border border-white/[0.08] rounded-2xl p-3 sm:p-4 flex items-center justify-between">
                        {/* Team 1 */}
                        <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
                          <div
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-black text-xs text-white shrink-0 shadow-lg"
                            style={{ backgroundColor: liveTeam1Color }}
                          >
                            {liveTeam1Tag || "T1"}
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-black text-white block truncate">{liveTeam1Name}</span>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase">{liveTeam1Tag}</span>
                          </div>
                        </div>

                        {/* Clean VS Indicator */}
                        <div className="px-2.5 sm:px-3 py-1 bg-white/10 border border-white/20 rounded-xl mx-1.5 sm:mx-2 shrink-0 flex items-center justify-center">
                          <span className="text-xs font-black italic tracking-widest text-white">VS</span>
                        </div>

                        {/* Team 2 */}
                        <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0 justify-end text-right">
                          <div className="truncate">
                            <span className="text-xs font-black text-white block truncate">{liveTeam2Name}</span>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase">{liveTeam2Tag}</span>
                          </div>
                          <div
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-black text-xs text-white shrink-0 shadow-lg"
                            style={{ backgroundColor: liveTeam2Color }}
                          >
                            {liveTeam2Tag || "T2"}
                          </div>
                        </div>
                      </div>

                      {/* Action button link preview */}
                      <div className="relative z-10 pt-1 flex items-center justify-between gap-2 sm:gap-3">
                        <div className="truncate text-[11px] text-zinc-400 flex items-center gap-1.5 flex-1 min-w-0">
                          <ExternalLink className="w-3 h-3 text-red-400 shrink-0" />
                          <span className="truncate font-mono">{liveStreamUrl || "No URL set"}</span>
                        </div>

                        <a
                          href={liveStreamUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-white hover:bg-zinc-200 text-black text-xs font-black px-3.5 sm:px-4 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-md"
                        >
                          <Radio className="w-3.5 h-3.5 text-red-600" />
                          <span>Watch Live</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Right: Broadcast Settings Form */}
                  <div className="lg:col-span-7">
                    <form onSubmit={handleSaveLiveMatch} className="space-y-4">
                      {/* Presets Bar */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase shrink-0">Quick Presets:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setLiveTitle("Valorant Champions • Semifinals");
                            setLiveStage("Map 1: Ascent");
                            setLiveGameType("VALORANT");
                            setLiveTeam1Name("Team Nova");
                            setLiveTeam1Tag("NOVA");
                            setLiveTeam1Color("#6366F1");
                            setLiveTeam2Name("Vortex");
                            setLiveTeam2Tag("VTX");
                            setLiveTeam2Color("#FF2E93");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold border border-white/10 transition-all shrink-0"
                        >
                          Valorant
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLiveTitle("BGMI Pro League • Grand Finals");
                            setLiveStage("Match 4: Erangel");
                            setLiveGameType("BGMI");
                            setLiveTeam1Name("Soul Esports");
                            setLiveTeam1Tag("SOUL");
                            setLiveTeam1Color("#10B981");
                            setLiveTeam2Name("GodLike");
                            setLiveTeam2Tag("GODL");
                            setLiveTeam2Color("#F59E0B");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold border border-white/10 transition-all shrink-0"
                        >
                          BGMI
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLiveTitle("Free Fire Clash Squad • Finals");
                            setLiveStage("Round 5: Bermuda");
                            setLiveGameType("FREE FIRE");
                            setLiveTeam1Name("Total Gaming");
                            setLiveTeam1Tag("TG");
                            setLiveTeam1Color("#EC4899");
                            setLiveTeam2Name("Orangutan");
                            setLiveTeam2Tag("OG");
                            setLiveTeam2Color("#3B82F6");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold border border-white/10 transition-all shrink-0"
                        >
                          Free Fire
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLiveTitle("Tekken 8 Global Showdown");
                            setLiveStage("Best of 5 • Bracket Reset");
                            setLiveGameType("Tekken 8");
                            setLiveTeam1Name("Arslan Ash");
                            setLiveTeam1Tag("ASH");
                            setLiveTeam1Color("#8B5CF6");
                            setLiveTeam2Name("Knee");
                            setLiveTeam2Tag("KNEE");
                            setLiveTeam2Color("#EF4444");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold border border-white/10 transition-all shrink-0"
                        >
                          Tekken 8
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                            Match Broadcast Title *
                          </label>
                          <input
                            type="text"
                            value={liveTitle}
                            onChange={(e) => setLiveTitle(e.target.value)}
                            placeholder="e.g. LIVE • Valorant • Semifinals"
                            className="glass-input w-full rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                            Stage / Map Info *
                          </label>
                          <input
                            type="text"
                            value={liveStage}
                            onChange={(e) => setLiveStage(e.target.value)}
                            placeholder="e.g. Map 1: Ascent or Grand Finals"
                            className="glass-input w-full rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                          Game Category
                        </label>
                        <select
                          value={liveGameType}
                          onChange={(e) => setLiveGameType(e.target.value)}
                          className="glass-input w-full rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                        >
                          {(games.filter((g) => g.isActive).length > 0
                            ? games.filter((g) => g.isActive)
                            : games
                          ).map((g) => (
                            <option key={g.id} value={g.name} className="bg-black text-white">
                              {g.name} ({g.tag})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Team 1 & Team 2 Dual Columns */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-2 border-t border-white/[0.08]">
                        {/* Team 1 */}
                        <div className="bg-black/30 border border-white/[0.06] rounded-2xl p-4 space-y-3">
                          <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider block">
                            Team 1 (Left Side)
                          </span>
                          <div>
                            <label className="text-[9px] text-zinc-400 uppercase font-bold block mb-1">Team Name</label>
                            <input
                              type="text"
                              value={liveTeam1Name}
                              onChange={(e) => setLiveTeam1Name(e.target.value)}
                              placeholder="e.g. Team Nova"
                              className="glass-input w-full rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] text-zinc-400 uppercase font-bold block mb-1">Tag (Max 4)</label>
                              <input
                                type="text"
                                value={liveTeam1Tag}
                                onChange={(e) => setLiveTeam1Tag(e.target.value.toUpperCase())}
                                maxLength={4}
                                placeholder="NOVA"
                                className="glass-input w-full rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-white uppercase focus:outline-none"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-zinc-400 uppercase font-bold block mb-1">Color</label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="color"
                                  value={liveTeam1Color}
                                  onChange={(e) => setLiveTeam1Color(e.target.value)}
                                  className="w-7 h-7 rounded-lg border-0 bg-transparent cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={liveTeam1Color}
                                  onChange={(e) => setLiveTeam1Color(e.target.value)}
                                  className="glass-input w-full rounded-xl px-2 py-1.5 text-[10px] font-mono text-zinc-300 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Team 2 */}
                        <div className="bg-black/30 border border-white/[0.06] rounded-2xl p-4 space-y-3">
                          <span className="text-[10px] font-black uppercase text-pink-400 tracking-wider block">
                            Team 2 (Right Side)
                          </span>
                          <div>
                            <label className="text-[9px] text-zinc-400 uppercase font-bold block mb-1">Team Name</label>
                            <input
                              type="text"
                              value={liveTeam2Name}
                              onChange={(e) => setLiveTeam2Name(e.target.value)}
                              placeholder="e.g. Vortex"
                              className="glass-input w-full rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] text-zinc-400 uppercase font-bold block mb-1">Tag (Max 4)</label>
                              <input
                                type="text"
                                value={liveTeam2Tag}
                                onChange={(e) => setLiveTeam2Tag(e.target.value.toUpperCase())}
                                maxLength={4}
                                placeholder="VTX"
                                className="glass-input w-full rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-white uppercase focus:outline-none"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-zinc-400 uppercase font-bold block mb-1">Color</label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="color"
                                  value={liveTeam2Color}
                                  onChange={(e) => setLiveTeam2Color(e.target.value)}
                                  className="w-7 h-7 rounded-lg border-0 bg-transparent cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={liveTeam2Color}
                                  onChange={(e) => setLiveTeam2Color(e.target.value)}
                                  className="glass-input w-full rounded-xl px-2 py-1.5 text-[10px] font-mono text-zinc-300 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stream URL Config */}
                      <div className="pt-2 border-t border-white/[0.08] space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase block">
                          Live Stream / YouTube Broadcast Destination URL *
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={liveStreamUrl}
                            onChange={(e) => setLiveStreamUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=... or https://twitch.tv/..."
                            className="glass-input flex-1 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-white focus:outline-none min-w-0"
                            required
                          />
                          <a
                            href={liveStreamUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Test</span>
                          </a>
                        </div>
                        <p className="text-[10px] text-zinc-500">
                          When users tap on this VS Card or &ldquo;Watch Live&rdquo; in the mobile app, it will directly open this YouTube or Twitch stream link.
                        </p>
                      </div>

                      {/* Active Toggle Switch & Save */}
                      <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={liveIsActive}
                            onChange={(e) => setLiveIsActive(e.target.checked)}
                            className="w-5 h-5 accent-red-500 rounded cursor-pointer shrink-0"
                          />
                          <div>
                            <span className="text-xs font-black text-white block">Publish Live Broadcast to Mobile App</span>
                            <span className="text-[10px] text-zinc-400 block">Show this match live in the Arena carousel for all users</span>
                          </div>
                        </label>

                        <button
                          type="submit"
                          disabled={isSavingLive}
                          className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-zinc-200 text-black font-black rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-xl hover:shadow-white/10 cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          {isSavingLive ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Saving &amp; Updating App...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>{editingMatchId ? "Save & Update VS Card" : "Publish New VS Card"}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>

      {/* ============================================================ */}
      {/* GLOSSY ROSTER INSPECTOR & ROOM PASS APPROVAL MODAL */}
      {/* ============================================================ */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="glass-panel border-2 border-white/20 w-full max-w-xl rounded-3xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto space-y-4 sm:space-y-5 text-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-3 h-8 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      selectedReg.gameType === "VALORANT"
                        ? "#FF2E93"
                        : selectedReg.gameType === "BGMI"
                        ? "#F59E0B"
                        : "#6366F1",
                  }}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-black text-white truncate">{selectedReg.teamName}</h3>
                    <span className="text-[10px] font-black uppercase text-zinc-400 bg-white/10 px-2 py-0.5 rounded shrink-0">
                      {selectedReg.gameType}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-semibold truncate">{selectedReg.tournamentTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <button
                  onClick={() => handleDeleteRegistration(selectedReg.id)}
                  title="Delete Registration"
                  className="w-8 h-8 rounded-full glass-icon-btn flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 font-black cursor-pointer transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedReg(null)}
                  className="w-8 h-8 rounded-full glass-icon-btn flex items-center justify-center text-zinc-400 hover:text-white font-black cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Captain & Emergency Coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/40 border border-white/[0.06] rounded-2xl p-3.5 sm:p-4">
              <div>
                <span className="text-[9px] text-zinc-500 uppercase font-black block">Captain In-Game ID</span>
                <span className="text-xs font-mono font-bold text-white mt-0.5 block truncate">{selectedReg.captainGameId}</span>
                <span className="text-[10px] text-zinc-400 block truncate">{"IGN: " + selectedReg.captainIgn}</span>
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 uppercase font-black block">
                  {"Emergency Ping (" + selectedReg.contactType + ")"}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 mt-0.5 block truncate">
                  {selectedReg.contactHandle}
                </span>
                <span className="text-[10px] text-zinc-400 block truncate">{selectedReg.deviceInfo || "Standard Client"}</span>
              </div>
            </div>

            {/* Full Roster Roster Inspector */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                Submitted Roster Lineup
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedReg.roster && selectedReg.roster.length > 0 ? (
                  selectedReg.roster.map((p, idx) => (
                    <div key={idx} className="bg-black/30 border border-white/[0.06] rounded-xl p-2.5">
                      <span className="text-[9px] text-zinc-500 font-bold block">{"Slot " + (idx + 2)}</span>
                      <span className="text-xs font-bold text-white block truncate">{p.name}</span>
                      <span className="text-[10px] font-mono text-zinc-400 block truncate">{p.id}</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-1 sm:col-span-2 text-xs text-zinc-500 italic">Solo fighter registration</div>
                )}
              </div>
            </div>

            {/* Room Credentials Release Console */}
            <div className="bg-[#08090C] border border-white/[0.12] rounded-2xl p-3.5 sm:p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-white" />
                  <span className="text-xs font-black text-white uppercase">Room Credentials Vault Console</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-bold">Encrypted Release to Profile</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                    Official Room ID <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={customRoomId}
                    onChange={(e) => setCustomRoomId(e.target.value)}
                    placeholder="e.g. 5189230 or GNF-VAL-4821"
                    className="glass-input w-full rounded-xl px-3 py-2 text-xs font-mono font-bold text-white placeholder:text-zinc-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                    Room Password <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={customRoomPass}
                    onChange={(e) => setCustomRoomPass(e.target.value)}
                    placeholder="e.g. gnf482"
                    className="glass-input w-full rounded-xl px-3 py-2 text-xs font-mono font-bold text-white placeholder:text-zinc-600 focus:outline-none"
                  />
                </div>
              </div>

              {(!customRoomId.trim() || !customRoomPass.trim()) && (
                <div className="flex items-center gap-2 text-[11px] text-amber-400/90 font-medium bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>Room ID &amp; Password are required. Please fill both to approve &amp; release to the user.</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
              <button
                onClick={() => handleReject(selectedReg.id)}
                className="flex-1 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/60 font-bold py-3 rounded-2xl text-xs transition-all cursor-pointer text-center"
              >
                Reject / Flag Roster
              </button>

              <button
                onClick={() => handleApprove(selectedReg.id)}
                disabled={!customRoomId.trim() || !customRoomPass.trim()}
                className="flex-2 bg-white hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:border disabled:border-white/10 disabled:cursor-not-allowed text-black font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xl hover:shadow-white/10 transition-all cursor-pointer active:scale-95 text-center"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Approve &amp; Unlock Room Pass to Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CREATE TOURNAMENT MODAL */}
      {/* ============================================================ */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="glass-panel border-2 border-white/20 w-full max-w-lg rounded-3xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-white" />
                Deploy Tournament Lobby
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="w-8 h-8 rounded-full glass-icon-btn flex items-center justify-center text-zinc-400 hover:text-white font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTournament} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Tournament Title *</label>
                <input
                  type="text"
                  placeholder="e.g. BGMI Masters Pro League #1"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="glass-input w-full rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-2">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Game</label>
                  <select
                    value={newGame}
                    onChange={(e) => setNewGame(e.target.value)}
                    className="glass-input w-full rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                  >
                    {(games.filter((g) => g.isActive).length > 0
                      ? games.filter((g) => g.isActive)
                      : games
                    ).map((g) => (
                      <option key={g.id} value={g.name} className="bg-black text-white">
                        {g.name} ({g.tag})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Total Prize Pool</label>
                  <input
                    type="text"
                    value={newPrize}
                    onChange={(e) => setNewPrize(e.target.value)}
                    placeholder="e.g. ₹50,000"
                    className="glass-input w-full rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-2">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Entry Fee / Pricing *</label>
                  <input
                    type="text"
                    value={newEntryFee}
                    onChange={(e) => setNewEntryFee(e.target.value)}
                    placeholder="e.g. FREE ENTRY or ₹100 / Team"
                    className="glass-input w-full rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Server / Region</label>
                  <input
                    type="text"
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    placeholder="e.g. Mumbai (India)"
                    className="glass-input w-full rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-2">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Max Slots</label>
                  <input
                    type="text"
                    value={newSlots}
                    onChange={(e) => setNewSlots(e.target.value)}
                    className="glass-input w-full rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Match Start Time</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g. 06:00 PM Today"
                    className="glass-input w-full rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Prize Split Breakdown */}
              <div className="border-t border-white/[0.08] pt-3">
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1.5">Prize Split Breakdown (Optional Overrides)</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] text-zinc-500 block mb-0.5">1st Place (50%)</label>
                    <input
                      type="text"
                      value={newFirstPrize}
                      onChange={(e) => setNewFirstPrize(e.target.value)}
                      placeholder="Auto ₹25K"
                      className="glass-input w-full rounded-xl px-2 py-1.5 text-[11px] font-bold text-emerald-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-500 block mb-0.5">2nd Place (30%)</label>
                    <input
                      type="text"
                      value={newSecondPrize}
                      onChange={(e) => setNewSecondPrize(e.target.value)}
                      placeholder="Auto ₹15K"
                      className="glass-input w-full rounded-xl px-2 py-1.5 text-[11px] font-bold text-zinc-300 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-500 block mb-0.5">3rd Place (20%)</label>
                    <input
                      type="text"
                      value={newThirdPrize}
                      onChange={(e) => setNewThirdPrize(e.target.value)}
                      placeholder="Auto ₹10K"
                      className="glass-input w-full rounded-xl px-2 py-1.5 text-[11px] font-bold text-zinc-300 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-white hover:bg-zinc-200 text-black font-black py-3 rounded-2xl text-xs transition-all shadow-xl hover:shadow-white/10 cursor-pointer mt-3 active:scale-95"
              >
                Deploy Tournament Lobby to Edge
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ADD NEW GAME MODAL */}
      {/* ============================================================ */}
      {addGameModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="glass-panel border-2 border-white/20 w-full max-w-md rounded-3xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-white" />
                Add New Esports Game
              </h3>
              <button
                onClick={() => setAddGameModalOpen(false)}
                className="w-8 h-8 rounded-full glass-icon-btn flex items-center justify-center text-zinc-400 hover:text-white font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGame} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Game Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Legends, Call of Duty: Mobile"
                  value={newGameName}
                  onChange={(e) => {
                    setNewGameName(e.target.value);
                    if (!newGameTag) {
                      const words = e.target.value.trim().split(" ");
                      if (words.length >= 2) {
                        setNewGameTag(words.map((w) => w[0]).join("").toUpperCase().slice(0, 4));
                      } else if (words[0]?.length >= 3) {
                        setNewGameTag(words[0].slice(0, 4).toUpperCase());
                      }
                    }
                  }}
                  className="glass-input w-full rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Short Tag / Badge (Max 4 chars) *</label>
                <input
                  type="text"
                  placeholder="e.g. APEX, CODM, OW2"
                  value={newGameTag}
                  onChange={(e) => setNewGameTag(e.target.value.toUpperCase())}
                  maxLength={5}
                  className="glass-input w-full rounded-xl px-3 py-2 text-xs font-bold text-white uppercase focus:outline-none"
                  required
                />
              </div>

              {/* Color Theme Selector */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1.5">Theme &amp; Badge Color</label>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {[
                    "#FF2E93", // Neon Pink
                    "#F59E0B", // Amber Gold
                    "#6366F1", // Indigo Blue
                    "#10B981", // Emerald Green
                    "#8B5CF6", // Purple
                    "#06B6D4", // Cyan
                    "#E11D48", // Crimson Red
                    "#EA580C", // Orange
                    "#111827", // Dark Slate
                  ].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewGameColor(c)}
                      className={"w-7 h-7 rounded-xl transition-all cursor-pointer " +
                        (newGameColor === c ? "ring-2 ring-white scale-110 shadow-lg" : "opacity-80 hover:opacity-100")}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <input
                  type="text"
                  value={newGameColor}
                  onChange={(e) => setNewGameColor(e.target.value)}
                  placeholder="#HEX Color"
                  className="glass-input w-full rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-zinc-300 focus:outline-none"
                />
              </div>

              {/* Active Toggle Switch */}
              <div className="bg-black/30 border border-white/[0.06] rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Publish Live to Mobile App</span>
                  <span className="text-[10px] text-zinc-400 block">Game immediately shows in App Browse &amp; Filters</span>
                </div>
                <input
                  type="checkbox"
                  checked={newGameIsActive}
                  onChange={(e) => setNewGameIsActive(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-white hover:bg-zinc-200 text-black font-black py-3 rounded-2xl text-xs transition-all shadow-xl hover:shadow-white/10 cursor-pointer mt-3 active:scale-95"
              >
                Save &amp; Sync Game to Mobile App
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
