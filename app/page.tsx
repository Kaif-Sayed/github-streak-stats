"use client";

import { useState, useId, useSyncExternalStore, useMemo } from "react";
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

  // Theme & Color states
  const [selectedThemeKey, setSelectedThemeKey] = useState<string>("cyberpunk");
  const [useCustomColors, setUseCustomColors] = useState<boolean>(false);
  const [customColors, setCustomColors] = useState<Omit<StreakTheme, "name">>({
    background: THEMES.cyberpunk.background,
    border: THEMES.cyberpunk.border,
    stroke: THEMES.cyberpunk.stroke,
    text: THEMES.cyberpunk.text,
    label: THEMES.cyberpunk.label,
    fire: THEMES.cyberpunk.fire,
    ringBg: THEMES.cyberpunk.ringBg,
  });

  // Display options
  const [radius, setRadius] = useState<number>(12);
  const [hideBorder, setHideBorder] = useState<boolean>(false);

  // UI Canvas preview mode
  const [canvasBg, setCanvasBg] = useState<"dark" | "dim" | "light">("dark");

  // Interaction states
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"markdown" | "html" | "url">("markdown");

  const origin = useOrigin();
  const usernameInputId = useId();

  const currentTheme = THEMES[selectedThemeKey] || THEMES.cyberpunk;

  // Change theme preset
  const handleThemeChange = (key: string) => {
    setSelectedThemeKey(key);
    const theme = THEMES[key];
    if (theme) {
      setCustomColors({
        background: theme.background,
        border: theme.border,
        stroke: theme.stroke,
        text: theme.text,
        label: theme.label,
        fire: theme.fire,
        ringBg: theme.ringBg,
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
        text: currentTheme.text,
        label: currentTheme.label,
        fire: currentTheme.fire,
        ringBg: currentTheme.ringBg,
      });
    }
  };

  // Build query string
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("user", activeUser);

    if (selectedThemeKey !== "cyberpunk" && !useCustomColors) {
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
      if (customColors.text !== currentTheme.text) {
        params.set("text", customColors.text.replace("#", ""));
      }
      if (customColors.fire !== currentTheme.fire) {
        params.set("fire", customColors.fire.replace("#", ""));
      }
      if (customColors.label !== currentTheme.label) {
        params.set("label", customColors.label.replace("#", ""));
      }
      if (customColors.ringBg !== currentTheme.ringBg) {
        params.set("ring_bg", customColors.ringBg.replace("#", ""));
      }
    }

    if (hideBorder) {
      params.set("hide_border", "true");
    }

    if (radius !== 12) {
      params.set("radius", radius.toString());
    }

    return params.toString();
  }, [activeUser, selectedThemeKey, useCustomColors, customColors, currentTheme, hideBorder, radius]);

  const baseUrl = origin || "http://localhost:3000";
  const apiPath = `/api/streak?${queryParams}`;
  const fullBadgeUrl = `${baseUrl}${apiPath}`;
  const previewImgUrl = refreshKey > 0 ? `${apiPath}&v=${refreshKey}` : apiPath;

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
          style={{ backgroundColor: useCustomColors ? customColors.stroke : currentTheme.stroke }}
        />
        <div className="absolute top-1/3 -left-48 w-96 h-96 bg-purple-600/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-cyan-600/10 blur-[130px] rounded-full" />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-20 border-b border-[#21262D]/80 backdrop-blur-xl bg-[#070A0F]/80 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-base">GitHub Streak</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Studio
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">Dynamic SVG Stats Card Generator</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={fullBadgeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#161B22] hover:bg-[#21262D] text-zinc-300 hover:text-white border border-[#30363D] transition-colors flex items-center gap-1.5"
            >
              <span>API Route</span>
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
                  className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/20 active:scale-95 shrink-0 cursor-pointer"
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
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
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
                          ? "bg-[#1A2230] border-cyan-400 ring-1 ring-cyan-400 shadow-md shadow-cyan-500/10"
                          : "bg-[#131924]/60 border-[#262C36] hover:border-zinc-500 hover:bg-[#161D2B]"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                          {theme.name}
                        </span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
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
                          style={{ backgroundColor: theme.stroke }}
                          title={`Stroke: ${theme.stroke}`}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0"
                          style={{ backgroundColor: theme.text }}
                          title={`Text: ${theme.text}`}
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
                    Custom Color Overrides
                  </h2>
                  <label className="relative inline-flex items-center cursor-pointer ml-1">
                    <input
                      type="checkbox"
                      checked={useCustomColors}
                      onChange={(e) => setUseCustomColors(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-500"></div>
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

                {/* Numbers / Title */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090D14] border border-[#21262D]">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={customColors.text}
                      onChange={(e) => handleColorChange("text", e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">Stats Text</div>
                      <div className="text-[10px] font-mono text-zinc-500">{customColors.text}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">text</span>
                </div>

                {/* Highlight / Stroke */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090D14] border border-[#21262D]">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={customColors.stroke}
                      onChange={(e) => handleColorChange("stroke", e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">Streak Ring</div>
                      <div className="text-[10px] font-mono text-zinc-500">{customColors.stroke}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">stroke</span>
                </div>

                {/* Border */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090D14] border border-[#21262D]">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={customColors.border}
                      onChange={(e) => handleColorChange("border", e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">Card Border</div>
                      <div className="text-[10px] font-mono text-zinc-500">{customColors.border}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">border</span>
                </div>

                {/* Fire / Active Badge */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090D14] border border-[#21262D]">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={customColors.fire}
                      onChange={(e) => handleColorChange("fire", e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">Flame / Badge</div>
                      <div className="text-[10px] font-mono text-zinc-500">{customColors.fire}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">fire</span>
                </div>

                {/* Subtitles & Labels */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090D14] border border-[#21262D]">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={customColors.label}
                      onChange={(e) => handleColorChange("label", e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">Muted Labels</div>
                      <div className="text-[10px] font-mono text-zinc-500">{customColors.label}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">label</span>
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
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                  </h2>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono">
                    SVG 495×195
                  </span>
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
                {/* Dynamic radial glow matching stroke color */}
                <div
                  className="absolute w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-25 transition-all duration-500"
                  style={{
                    backgroundColor: useCustomColors ? customColors.stroke : currentTheme.stroke,
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

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy("markdown", markdownSnippet)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
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
                    onClick={() => setRefreshKey((k) => k + 1)}
                    title="Bust cache and refresh SVG"
                    className="p-2 rounded-lg bg-[#161B22] text-zinc-400 hover:text-white border border-[#30363D] hover:border-zinc-500 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
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
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-sm">
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
        <p>GitHub Streak Generator Studio • Designed for modern developer profiles</p>
      </footer>
    </div>
  );
}
