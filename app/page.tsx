"use client";

import { useState, useId, useSyncExternalStore, useMemo, useEffect } from "react";
import { THEMES, StreakTheme } from "./api/streak/route";

const emptySubscribe = () => () => {};

function useOrigin() {
  return useSyncExternalStore(
    emptySubscribe,
    () => window.location.origin,
    () => ""
  );
}

export default function Home() {
  // User input states
  const [inputUser, setInputUser] = useState("KaifSayed");
  const [activeUser, setActiveUser] = useState("KaifSayed");

  // Theme & Color states - default to horizon matching user screenshot
  const [selectedThemeKey, setSelectedThemeKey] = useState<string>("horizon");
  const [useCustomColors, setUseCustomColors] = useState<boolean>(false);
  const [customColors, setCustomColors] = useState<Omit<StreakTheme, "name">>({
    background: THEMES.horizon.background,
    border: THEMES.horizon.border,
    stroke: THEMES.horizon.stroke,
    ring: THEMES.horizon.ring,
    fire: THEMES.horizon.fire,
    currStreakNum: THEMES.horizon.currStreakNum,
    sideNums: THEMES.horizon.sideNums,
    currStreakLabel: THEMES.horizon.currStreakLabel,
    sideLabels: THEMES.horizon.sideLabels,
    dates: THEMES.horizon.dates,
  });

  // Display options
  const [radius, setRadius] = useState<number>(10);
  const [hideBorder, setHideBorder] = useState<boolean>(false);

  // UI Canvas preview mode
  const [canvasBg, setCanvasBg] = useState<"dark" | "dim" | "light">("dark");

  // Interaction states
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"markdown" | "html" | "url">("markdown");
  const [cycleSeconds, setCycleSeconds] = useState(5);

  const origin = useOrigin();
  const usernameInputId = useId();

  const currentTheme = THEMES[selectedThemeKey] || THEMES.horizon;

  // 5-second countdown timer for visual loop feedback
  useEffect(() => {
    const timer = setInterval(() => {
      setCycleSeconds((s) => (s <= 1 ? 5 : s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Change theme preset
  const handleThemeChange = (key: string) => {
    setSelectedThemeKey(key);
    const theme = THEMES[key];
    if (theme) {
      setCustomColors({
        background: theme.background,
        border: theme.border,
        stroke: theme.stroke,
        ring: theme.ring,
        fire: theme.fire,
        currStreakNum: theme.currStreakNum,
        sideNums: theme.sideNums,
        currStreakLabel: theme.currStreakLabel,
        sideLabels: theme.sideLabels,
        dates: theme.dates,
      });
    }
  };

  // Update a single custom color
  const handleColorChange = (key: keyof Omit<StreakTheme, "name">, value: string) => {
    setUseCustomColors(true);
    setCustomColors((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Reset custom colors back to selected preset
  const handleResetColors = () => {
    setUseCustomColors(false);
    if (currentTheme) {
      setCustomColors({
        background: currentTheme.background,
        border: currentTheme.border,
        stroke: currentTheme.stroke,
        ring: currentTheme.ring,
        fire: currentTheme.fire,
        currStreakNum: currentTheme.currStreakNum,
        sideNums: currentTheme.sideNums,
        currStreakLabel: currentTheme.currStreakLabel,
        sideLabels: currentTheme.sideLabels,
        dates: currentTheme.dates,
      });
    }
  };

  // Build query string
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("user", activeUser);

    if (selectedThemeKey !== "horizon" && !useCustomColors) {
      params.set("theme", selectedThemeKey);
    }

    if (useCustomColors) {
      if (customColors.background !== currentTheme.background) {
        params.set("bg", customColors.background.replace("#", ""));
      }
      if (customColors.border !== currentTheme.border) {
        params.set("border", customColors.border.replace("#", ""));
      }
      if (customColors.stroke !== currentTheme.stroke) {
        params.set("stroke", customColors.stroke.replace("#", ""));
      }
      if (customColors.ring !== currentTheme.ring) {
        params.set("ring", customColors.ring.replace("#", ""));
      }
      if (customColors.fire !== currentTheme.fire) {
        params.set("fire", customColors.fire.replace("#", ""));
      }
      if (customColors.currStreakNum !== currentTheme.currStreakNum) {
        params.set("currStreakNum", customColors.currStreakNum.replace("#", ""));
      }
      if (customColors.sideNums !== currentTheme.sideNums) {
        params.set("sideNums", customColors.sideNums.replace("#", ""));
      }
      if (customColors.currStreakLabel !== currentTheme.currStreakLabel) {
        params.set("currStreakLabel", customColors.currStreakLabel.replace("#", ""));
      }
      if (customColors.sideLabels !== currentTheme.sideLabels) {
        params.set("sideLabels", customColors.sideLabels.replace("#", ""));
      }
      if (customColors.dates !== currentTheme.dates) {
        params.set("dates", customColors.dates.replace("#", ""));
      }
    }

    if (hideBorder) {
      params.set("hide_border", "true");
    }

    if (radius !== 10) {
      params.set("radius", radius.toString());
    }

    return params.toString();
  }, [activeUser, selectedThemeKey, useCustomColors, customColors, currentTheme, hideBorder, radius]);

  const baseUrl = origin || "http://localhost:3000";
  const apiPath = `/api/streak?${queryParams}`;
  const fullBadgeUrl = `${baseUrl}${apiPath}`;
  const previewImgUrl = `${apiPath}&_v=${refreshKey}_${activeUser}`;

  const markdownSnippet = `[![GitHub Streak](${fullBadgeUrl})](https://github.com/${activeUser})`;
  const htmlSnippet = `<a href="https://github.com/${activeUser}">\n  <img src="${fullBadgeUrl}" alt="${activeUser}'s GitHub Streak" />\n</a>`;
  const urlSnippet = fullBadgeUrl;

  const handleCopy = async (type: "markdown" | "html" | "url", text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(previewImgUrl);
      const svgText = await res.text();
      const blob = new Blob([svgText], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeUser}-streak.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback
    }
  };

  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputUser.trim();
    if (trimmed) {
      setActiveUser(trimmed);
      setRefreshKey((k) => k + 1);
    }
  };

  const handlePresetUser = (name: string) => {
    setInputUser(name);
    setActiveUser(name);
    setRefreshKey((k) => k + 1);
  };

  const canvasBackgroundClass =
    canvasBg === "dark"
      ? "bg-[#0D1117] border-[#30363D]"
      : canvasBg === "dim"
      ? "bg-[#161B22] border-[#30363D]"
      : "bg-[#F6F8FA] border-[#D0D7DE]";

  return (
    <div className="min-h-screen bg-[#070A0F] text-[#E6EDF3] flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[550px] blur-[140px] rounded-full opacity-20 transition-all duration-700"
          style={{ backgroundColor: useCustomColors ? customColors.ring : currentTheme.ring }}
        />
        <div className="absolute top-1/3 -left-48 w-96 h-96 bg-purple-600/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-cyan-600/10 blur-[130px] rounded-full" />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-20 border-b border-[#21262D]/80 backdrop-blur-xl bg-[#070A0F]/80 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E95678] via-[#FAB795] to-[#59E1E3] flex items-center justify-center shadow-lg shadow-pink-500/20">
              {/* Fire Logo */}
              <svg className="w-5 h-5 text-black font-bold" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C9.5 7 15 9 25 14c-1-2-3-3-3-5-3 3-4 6-4 9a7 7 0 0014 0c0-6-7-9-7-16z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-base">GitHub Streak</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Studio
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">Animated SVG Stats Card Generator</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={fullBadgeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#161B22] hover:bg-[#21262D] text-zinc-300 hover:text-white border border-[#30363D] transition-colors flex items-center gap-1.5"
            >
              <span>Raw SVG Route</span>
              <svg className="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Main Studio Content */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
        {/* Studio Layout: 2 Columns on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT COLUMN: STUDIO CONTROLS ================= */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            
            {/* User Input Card */}
            <div className="p-5 rounded-2xl bg-[#0F141C]/90 border border-[#21262D] shadow-xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  GitHub Account
                </h2>
                <span className="text-xs text-zinc-500">Active: @{activeUser}</span>
              </div>

              <form onSubmit={handleSubmitUser} className="flex gap-2">
                <div className="relative flex-1">
                  <label htmlFor={usernameInputId} className="sr-only">GitHub Username</label>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 font-mono text-xs">
                    @
                  </div>
                  <input
                    id={usernameInputId}
                    type="text"
                    value={inputUser}
                    onChange={(e) => setInputUser(e.target.value)}
                    placeholder="Username (e.g. KaifSayed)"
                    className="w-full pl-8 pr-3 py-2.5 bg-[#090D14] border border-[#30363D] rounded-xl text-white placeholder-zinc-500 font-mono text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    autoComplete="off"
                    spellCheck="false"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gradient-to-r from-[#E95678] to-[#59E1E3] hover:opacity-90 text-black font-bold text-xs rounded-xl transition-all shadow-md shadow-pink-500/20 active:scale-95 shrink-0 cursor-pointer"
                >
                  Apply
                </button>
              </form>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-zinc-500 mr-1">Popular:</span>
                {["KaifSayed", "shadcn", "leerob", "torvalds", "antfu"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetUser(preset)}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer ${
                      activeUser === preset
                        ? "bg-cyan-500/15 border-cyan-400/60 text-cyan-300 font-semibold"
                        : "bg-[#161B22]/80 border-[#30363D] text-zinc-400 hover:text-white hover:border-zinc-500"
                    }`}
                  >
                    @{preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Presets Selector */}
            <div className="p-5 rounded-2xl bg-[#0F141C]/90 border border-[#21262D] shadow-xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pink-400" />
                  Theme Presets ({Object.keys(THEMES).length})
                </h2>
                {useCustomColors && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Custom Overrides
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {Object.entries(THEMES).map(([key, theme]) => {
                  const isSelected = selectedThemeKey === key && !useCustomColors;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleThemeChange(key)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer group ${
                        isSelected
                          ? "bg-[#1A2230] border-[#E95678] ring-1 ring-[#E95678] shadow-md shadow-pink-500/10"
                          : "bg-[#131924]/60 border-[#262C36] hover:border-zinc-500 hover:bg-[#161D2B]"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                          {theme.name}
                        </span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E95678] shrink-0" />
                        )}
                      </div>
                      {/* Color dots preview */}
                      <div className="flex items-center gap-1.5 p-1 rounded-md bg-black/40 border border-white/5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: theme.background }}
                          title={`Background: ${theme.background}`}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0"
                          style={{ backgroundColor: theme.ring }}
                          title={`Ring: ${theme.ring}`}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0"
                          style={{ backgroundColor: theme.currStreakNum }}
                          title={`Number: ${theme.currStreakNum}`}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0"
                          style={{ backgroundColor: theme.fire }}
                          title={`Fire: ${theme.fire}`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Palette Customizer */}
            <div className="p-5 rounded-2xl bg-[#0F141C]/90 border border-[#21262D] shadow-xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Color Customization
                  </h2>
                  <label className="relative inline-flex items-center cursor-pointer ml-1">
                    <input
                      type="checkbox"
                      checked={useCustomColors}
                      onChange={(e) => setUseCustomColors(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-pink-500"></div>
                  </label>
                </div>
                {useCustomColors && (
                  <button
                    type="button"
                    onClick={handleResetColors}
                    className="text-[11px] text-zinc-400 hover:text-cyan-300 underline cursor-pointer"
                  >
                    Reset to Theme
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Background */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090D14] border border-[#21262D]">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={customColors.background}
                      onChange={(e) => handleColorChange("background", e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">Background</div>
                      <div className="text-[10px] font-mono text-zinc-500">{customColors.background}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">bg</span>
                </div>

                {/* Streak Ring */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090D14] border border-[#21262D]">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={customColors.ring}
                      onChange={(e) => handleColorChange("ring", e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">Streak Ring</div>
                      <div className="text-[10px] font-mono text-zinc-500">{customColors.ring}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">ring</span>
                </div>

                {/* Fire / Flame Icon */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090D14] border border-[#21262D]">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={customColors.fire}
                      onChange={(e) => handleColorChange("fire", e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">Flame Icon</div>
                      <div className="text-[10px] font-mono text-zinc-500">{customColors.fire}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">fire</span>
                </div>

                {/* Center Number */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090D14] border border-[#21262D]">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={customColors.currStreakNum}
                      onChange={(e) => handleColorChange("currStreakNum", e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">Center Number</div>
                      <div className="text-[10px] font-mono text-zinc-500">{customColors.currStreakNum}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">currNum</span>
                </div>

                {/* Side Numbers */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090D14] border border-[#21262D]">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={customColors.sideNums}
                      onChange={(e) => handleColorChange("sideNums", e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">Side Numbers</div>
                      <div className="text-[10px] font-mono text-zinc-500">{customColors.sideNums}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">sideNums</span>
                </div>

                {/* Center Label */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090D14] border border-[#21262D]">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={customColors.currStreakLabel}
                      onChange={(e) => handleColorChange("currStreakLabel", e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">Current Label</div>
                      <div className="text-[10px] font-mono text-zinc-500">{customColors.currStreakLabel}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">currLbl</span>
                </div>

                {/* Side Labels */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090D14] border border-[#21262D]">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={customColors.sideLabels}
                      onChange={(e) => handleColorChange("sideLabels", e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">Side Labels</div>
                      <div className="text-[10px] font-mono text-zinc-500">{customColors.sideLabels}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">sideLbl</span>
                </div>

                {/* Date Ranges */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090D14] border border-[#21262D]">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={customColors.dates}
                      onChange={(e) => handleColorChange("dates", e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">Date Ranges</div>
                      <div className="text-[10px] font-mono text-zinc-500">{customColors.dates}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">dates</span>
                </div>

                {/* Divider Line / Stroke */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090D14] border border-[#21262D]">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={customColors.stroke}
                      onChange={(e) => handleColorChange("stroke", e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">Divider Lines</div>
                      <div className="text-[10px] font-mono text-zinc-500">{customColors.stroke}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">stroke</span>
                </div>

                {/* Card Border */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090D14] border border-[#21262D]">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={customColors.border}
                      onChange={(e) => handleColorChange("border", e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">Outer Border</div>
                      <div className="text-[10px] font-mono text-zinc-500">{customColors.border}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">border</span>
                </div>
              </div>
            </div>

            {/* Geometry & Display Options */}
            <div className="p-5 rounded-2xl bg-[#0F141C]/90 border border-[#21262D] shadow-xl backdrop-blur-xl space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Geometry &amp; Style
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Corner Radius Slider */}
                <div className="p-3 rounded-xl bg-[#090D14] border border-[#21262D] space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300 font-semibold">Corner Radius</span>
                    <span className="font-mono text-cyan-400">{radius}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                {/* Hide Border Checkbox */}
                <div className="p-3 rounded-xl bg-[#090D14] border border-[#21262D] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-zinc-300">Hide Outer Border</div>
                    <div className="text-[11px] text-zinc-500">Border-free minimalist card</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={hideBorder}
                    onChange={(e) => setHideBorder(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 text-cyan-500 focus:ring-cyan-400 cursor-pointer accent-cyan-400"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: LIVE PREVIEW & CODE STUDIO ================= */}
          <div className="lg:col-span-6 flex flex-col gap-6 lg:sticky lg:top-24">
            
            {/* Live Preview Card */}
            <div className="p-5 rounded-2xl bg-[#0F141C]/90 border border-[#21262D] shadow-2xl backdrop-blur-xl space-y-4">
              
              {/* Preview Header & Canvas switcher */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <span>Live Preview</span>
                  </h2>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>5s loop ({cycleSeconds}s)</span>
                  </div>
                </div>

                {/* Test on Different Backgrounds */}
                <div className="flex items-center gap-1.5 bg-[#090D14] p-1 rounded-lg border border-[#21262D] text-xs">
                  <span className="text-[10px] text-zinc-500 px-1.5 uppercase font-medium">Canvas:</span>
                  <button
                    type="button"
                    onClick={() => setCanvasBg("dark")}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                      canvasBg === "dark" ? "bg-[#21262D] text-white" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setCanvasBg("dim")}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                      canvasBg === "dim" ? "bg-[#21262D] text-white" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Dim
                  </button>
                  <button
                    type="button"
                    onClick={() => setCanvasBg("light")}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                      canvasBg === "light" ? "bg-[#D0D7DE] text-black font-semibold" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Light
                  </button>
                </div>
              </div>

              {/* Canvas viewport */}
              <div
                className={`relative rounded-xl border p-4 sm:p-8 flex flex-col items-center justify-center min-h-[240px] transition-colors duration-300 overflow-hidden ${canvasBackgroundClass}`}
              >
                {/* Dynamic radial glow matching ring color */}
                <div
                  className="absolute w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-25 transition-all duration-500"
                  style={{
                    backgroundColor: useCustomColors ? customColors.ring : currentTheme.ring,
                  }}
                />

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={previewImgUrl}
                  src={previewImgUrl}
                  alt={`GitHub Streak for ${activeUser}`}
                  width={495}
                  height={195}
                  className="relative z-10 max-w-full h-auto rounded-lg shadow-2xl transition-transform duration-300 hover:scale-[1.01]"
                />
              </div>

              {/* Animation Feature Highlight Badges */}
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] py-1">
                <div className="p-2 rounded-xl bg-[#090D14] border border-[#21262D]">
                  <span className="block font-semibold text-pink-400">⭕ Animated Ring</span>
                  <span className="text-[10px] text-zinc-500">Draws clockwise</span>
                </div>
                <div className="p-2 rounded-xl bg-[#090D14] border border-[#21262D]">
                  <span className="block font-semibold text-cyan-400">🔢 Number Scroll</span>
                  <span className="text-[10px] text-zinc-500">Vertical staggered roll</span>
                </div>
                <div className="p-2 rounded-xl bg-[#090D14] border border-[#21262D]">
                  <span className="block font-semibold text-emerald-400">⏱️ 5s Loop Cycle</span>
                  <span className="text-[10px] text-zinc-500">Infinite reloading</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy("markdown", markdownSnippet)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#E95678] to-[#59E1E3] hover:opacity-90 text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-pink-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    {copiedType === "markdown" ? (
                      <>
                        <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Copied Markdown!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Copy Markdown</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-3 py-2 rounded-xl bg-[#161B22] hover:bg-[#21262D] text-zinc-300 hover:text-white border border-[#30363D] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download SVG</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setRefreshKey((k) => k + 1);
                      setCycleSeconds(5);
                    }}
                    title="Replay 5s Animation Cycle"
                    className="px-2.5 py-1.5 rounded-lg bg-[#161B22] text-zinc-300 hover:text-white border border-[#30363D] hover:border-zinc-500 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Replay</span>
                  </button>

                  <a
                    href={fullBadgeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open standalone SVG in new tab"
                    className="p-2 rounded-lg bg-[#161B22] text-zinc-400 hover:text-white border border-[#30363D] hover:border-zinc-500 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Embed Snippets Studio */}
            <div className="p-5 rounded-2xl bg-[#0F141C]/90 border border-[#21262D] shadow-2xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Embed Code Snippet</h3>
                <div className="flex rounded-lg bg-[#090D14] p-1 border border-[#21262D]">
                  <button
                    type="button"
                    onClick={() => setActiveTab("markdown")}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                      activeTab === "markdown"
                        ? "bg-[#21262D] text-cyan-400 shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Markdown
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("html")}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                      activeTab === "html"
                        ? "bg-[#21262D] text-cyan-400 shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    HTML
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("url")}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                      activeTab === "url"
                        ? "bg-[#21262D] text-cyan-400 shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Direct URL
                  </button>
                </div>
              </div>

              {/* Code display block */}
              <div className="rounded-xl bg-[#090D14] border border-[#21262D] overflow-hidden">
                <div className="flex items-center justify-between px-3.5 py-2 bg-[#121722] border-b border-[#21262D] text-[11px] font-mono text-zinc-400">
                  <span>
                    {activeTab === "markdown" && "README.md (Profile)"}
                    {activeTab === "html" && "HTML Snippet"}
                    {activeTab === "url" && "REST Endpoint"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const text =
                        activeTab === "markdown"
                          ? markdownSnippet
                          : activeTab === "html"
                          ? htmlSnippet
                          : urlSnippet;
                      handleCopy(activeTab, text);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                  >
                    {copiedType === activeTab ? "✓ Copied" : "Copy Code"}
                  </button>
                </div>
                <pre className="p-3.5 overflow-x-auto text-xs font-mono text-cyan-300/90 leading-relaxed max-h-36">
                  <code>
                    {activeTab === "markdown" && markdownSnippet}
                    {activeTab === "html" && htmlSnippet}
                    {activeTab === "url" && urlSnippet}
                  </code>
                </pre>
              </div>

              {/* Generated Query Param string indicator */}
              <div className="text-[11px] font-mono text-zinc-500 bg-[#090D14] p-2.5 rounded-lg border border-[#21262D] flex items-center justify-between gap-2 overflow-x-auto">
                <span className="text-zinc-400 shrink-0">Params:</span>
                <span className="text-cyan-400 truncate">{queryParams}</span>
              </div>
            </div>

          </div>

        </div>

        {/* Integration Instructions Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-5 rounded-2xl bg-[#0F141C]/60 border border-[#21262D] space-y-2">
            <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h4 className="text-sm font-semibold text-white">Customize &amp; Copy</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Enter your GitHub handle, pick a theme or choose custom hex colors, and copy the Markdown snippet.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0F141C]/60 border border-[#21262D] space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h4 className="text-sm font-semibold text-white">Paste in README.md</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Open your special GitHub profile repository (<code className="text-zinc-300 font-mono">username/username</code>) and paste into your README.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0F141C]/60 border border-[#21262D] space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h4 className="text-sm font-semibold text-white">Edge Cached &amp; Live</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your profile badge automatically updates each day with total contributions and ongoing commit streaks.
            </p>
          </div>
        </section>

        {/* Token Setup Banner */}
        <section className="p-5 rounded-2xl bg-[#0F141C]/80 border border-[#21262D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Environment Configuration</h4>
            </div>
            <p className="text-xs text-zinc-400">
              For local hosting, configure <code className="px-1.5 py-0.5 rounded bg-[#090D14] text-cyan-300 font-mono text-[11px]">GITHUB_TOKEN</code> in your <code className="px-1.5 py-0.5 rounded bg-[#090D14] text-zinc-300 font-mono text-[11px]">.env.local</code> file.
            </p>
          </div>
          <div className="shrink-0 font-mono text-xs text-cyan-300 bg-[#090D14] px-3 py-2 rounded-xl border border-[#21262D]">
            GITHUB_TOKEN=ghp_...
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#21262D]/70 py-6 text-center text-xs text-zinc-500">
        <p>GitHub Streak Generator Studio • Animated Developer Badges</p>
      </footer>
    </div>
  );
}
