import { NextRequest, NextResponse } from "next/server";

interface ContributionDay {
  contributionCount: number;
  date: string;
}

interface GraphQLResponse {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions: number;
          weeks: {
            contributionDays: ContributionDay[];
          }[];
        };
      };
    };
  };
  errors?: { message: string }[];
}

export interface StreakTheme {
  name: string;
  background: string;
  border: string;
  stroke: string;
  text: string;
  label: string;
  fire: string;
  ringBg: string;
}

export const THEMES: Record<string, StreakTheme> = {
  cyberpunk: {
    name: "Cyberpunk",
    background: "#0D1117",
    border: "#30363D",
    stroke: "#00F7FF",
    text: "#00F7FF",
    label: "#8B949E",
    fire: "#7C3AED",
    ringBg: "#21262D",
  },
  dracula: {
    name: "Dracula",
    background: "#282A36",
    border: "#6272A4",
    stroke: "#FF79C6",
    text: "#50FA7B",
    label: "#F8F8F2",
    fire: "#FFB86C",
    ringBg: "#44475A",
  },
  tokyonight: {
    name: "Tokyo Night",
    background: "#1A1B26",
    border: "#2F3549",
    stroke: "#7AA2F7",
    text: "#70A5FD",
    label: "#A9B1D6",
    fire: "#F7768E",
    ringBg: "#24283B",
  },
  "github-dark": {
    name: "GitHub Dark",
    background: "#010409",
    border: "#21262D",
    stroke: "#238636",
    text: "#3FB950",
    label: "#8B949E",
    fire: "#F0883E",
    ringBg: "#161B22",
  },
  nord: {
    name: "Nord",
    background: "#2E3440",
    border: "#4C566A",
    stroke: "#88C0D0",
    text: "#8FBCBB",
    label: "#D8DEE9",
    fire: "#BF616A",
    ringBg: "#3B4252",
  },
  emerald: {
    name: "Emerald",
    background: "#061A14",
    border: "#064E3B",
    stroke: "#10B981",
    text: "#34D399",
    label: "#A7F3D0",
    fire: "#F59E0B",
    ringBg: "#062E22",
  },
  sunset: {
    name: "Sunset",
    background: "#180D1C",
    border: "#4C1D4F",
    stroke: "#F43F5E",
    text: "#FB923C",
    label: "#FDA4AF",
    fire: "#E11D48",
    ringBg: "#2E1436",
  },
  radical: {
    name: "Radical",
    background: "#141321",
    border: "#342E52",
    stroke: "#FE428E",
    text: "#F8D847",
    label: "#A9FEF7",
    fire: "#FF6584",
    ringBg: "#242038",
  },
  "solarized-dark": {
    name: "Solarized",
    background: "#002B36",
    border: "#073642",
    stroke: "#268BD2",
    text: "#2AA198",
    label: "#93A1A1",
    fire: "#CB4B16",
    ringBg: "#073642",
  },
  light: {
    name: "Light",
    background: "#FFFFFF",
    border: "#D0D7DE",
    stroke: "#0969DA",
    text: "#1F2328",
    label: "#59636E",
    fire: "#BC4C00",
    ringBg: "#EAEFF5",
  },
};

function sanitizeColor(val: string | null | undefined, fallback: string): string {
  if (!val) return fallback;
  const trimmed = val.trim();
  if (trimmed.startsWith("#")) return trimmed;
  if (/^[0-9a-fA-F]{3,8}$/.test(trimmed)) {
    return `#${trimmed}`;
  }
  return trimmed;
}

function calculateStreaks(days: ContributionDay[]) {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // Sort ascending by date
  days.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate longest streak
  for (const day of days) {
    if (day.contributionCount > 0) {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  }

  // Calculate current streak backwards from today or yesterday
  const reversedDays = [...days].reverse();
  const todayEntry = reversedDays.find((d) => d.date === today);
  const yesterdayEntry = reversedDays.find((d) => d.date === yesterday);

  let startIndex = -1;
  if (todayEntry && todayEntry.contributionCount > 0) {
    startIndex = reversedDays.indexOf(todayEntry);
  } else if (yesterdayEntry && yesterdayEntry.contributionCount > 0) {
    startIndex = reversedDays.indexOf(yesterdayEntry);
  }

  if (startIndex !== -1) {
    for (let i = startIndex; i < reversedDays.length; i++) {
      if (reversedDays[i].contributionCount > 0) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak };
}

function generateErrorSVG(title: string, message: string, bg = "#0D1117", border = "#30363D") {
  return `
  <svg width="495" height="195" viewBox="0 0 495 195" fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>
      .bg { fill: ${bg}; rx: 12px; }
      .err-title { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 700; font-size: 18px; fill: #F87171; }
      .err-desc { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 400; font-size: 13px; fill: #8B949E; }
    </style>
    <rect width="495" height="195" class="bg" stroke="${border}" stroke-width="1" />
    <circle cx="247" cy="62" r="22" fill="#3B1219" stroke="#DC2626" stroke-width="1.5" />
    <text x="247" y="69" text-anchor="middle" font-size="18" fill="#F87171" font-weight="bold">!</text>
    <text x="247" y="112" text-anchor="middle" class="err-title">${title}</text>
    <text x="247" y="138" text-anchor="middle" class="err-desc">${message}</text>
  </svg>
  `;
}

interface RenderTheme {
  background: string;
  border: string;
  stroke: string;
  text: string;
  label: string;
  fire: string;
  ringBg: string;
  hideBorder: boolean;
  radius: number;
}

function generateStreakSVG(
  total: number,
  currentStreak: number,
  longestStreak: number,
  theme: RenderTheme
) {
  const statusLabel = currentStreak > 0 ? "🔥 Active" : "💤 Inactive";
  const statusColor = currentStreak > 0 ? theme.fire : theme.label;
  const borderAttr = theme.hideBorder ? "" : `stroke="${theme.border}" stroke-width="1"`;

  return `
  <svg width="495" height="195" viewBox="0 0 495 195" fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>
      .bg { fill: ${theme.background}; rx: ${theme.radius}px; }
      .title { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 700; font-size: 26px; fill: ${theme.text}; }
      .label { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 600; font-size: 13px; fill: ${theme.label}; }
      .sublabel { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 600; font-size: 11px; }
      .stat-circle-bg { stroke: ${theme.ringBg}; stroke-width: 4; }
      .stat-circle { stroke: ${theme.stroke}; stroke-width: 4; stroke-dasharray: 100; stroke-linecap: round; }
      .divider { stroke: ${theme.border}; stroke-width: 1; }
    </style>
    
    <rect width="495" height="195" class="bg" ${borderAttr} />

    <!-- Total Contributions -->
    <text x="85" y="75" text-anchor="middle" class="title">${total.toLocaleString()}</text>
    <text x="85" y="105" text-anchor="middle" class="label">Total Contributions</text>
    <text x="85" y="125" text-anchor="middle" class="sublabel" style="fill: ${theme.label};">All time</text>

    <!-- Divider 1 -->
    <line x1="170" y1="35" x2="170" y2="160" class="divider" />

    <!-- Current Streak (Center Highlight) -->
    <circle cx="247" cy="72" r="32" class="stat-circle-bg" fill="none" />
    <circle cx="247" cy="72" r="32" class="stat-circle" fill="none" />
    <text x="247" y="80" text-anchor="middle" class="title">${currentStreak}</text>
    <text x="247" y="130" text-anchor="middle" class="label" style="fill: ${theme.stroke};">Current Streak</text>
    <text x="247" y="148" text-anchor="middle" class="sublabel" style="fill: ${statusColor};">${statusLabel}</text>

    <!-- Divider 2 -->
    <line x1="325" y1="35" x2="325" y2="160" class="divider" />

    <!-- Longest Streak -->
    <text x="410" y="75" text-anchor="middle" class="title">${longestStreak}</text>
    <text x="410" y="105" text-anchor="middle" class="label">Longest Streak</text>
    <text x="410" y="125" text-anchor="middle" class="sublabel" style="fill: ${theme.fire};">Days</text>
  </svg>
  `;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawUser = searchParams.get("user");
  const username = (rawUser && rawUser.trim()) ? rawUser.trim() : "KaifSayed";

  const themeKey = (searchParams.get("theme") || "cyberpunk").toLowerCase();
  const baseTheme = THEMES[themeKey] || THEMES.cyberpunk;

  const bgParam = searchParams.get("bg") || searchParams.get("background");
  const borderParam = searchParams.get("border");
  const strokeParam = searchParams.get("stroke");
  const textParam = searchParams.get("text") || searchParams.get("color");
  const labelParam = searchParams.get("label");
  const fireParam = searchParams.get("fire");
  const ringBgParam = searchParams.get("ring_bg") || searchParams.get("ringBg");
  const hideBorder = searchParams.get("hide_border") === "true";
  const radiusParam = searchParams.get("radius");
  const radius = radiusParam !== null ? Math.max(0, Math.min(40, parseInt(radiusParam, 10) || 12)) : 12;

  const resolvedTheme: RenderTheme = {
    background: sanitizeColor(bgParam, baseTheme.background),
    border: sanitizeColor(borderParam, baseTheme.border),
    stroke: sanitizeColor(strokeParam, baseTheme.stroke),
    text: sanitizeColor(textParam, baseTheme.text),
    label: sanitizeColor(labelParam, baseTheme.label),
    fire: sanitizeColor(fireParam, baseTheme.fire),
    ringBg: sanitizeColor(ringBgParam, baseTheme.ringBg),
    hideBorder,
    radius,
  };

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    const errorSvg = generateErrorSVG(
      "GITHUB_TOKEN Not Configured",
      "Add GITHUB_TOKEN to your .env.local file",
      resolvedTheme.background,
      resolvedTheme.border
    );
    return new NextResponse(errorSvg, {
      status: 500,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables: { username } }),
      next: { revalidate: 3600 }, // Cache on Vercel Edge for 1 hour
    });

    const json: GraphQLResponse = await response.json();

    const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) {
      const notFoundSvg = generateErrorSVG(
        "GitHub User Not Found",
        `Could not find stats for "${username}"`,
        resolvedTheme.background,
        resolvedTheme.border
      );
      return new NextResponse(notFoundSvg, {
        status: 404,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }

    const days = calendar.weeks.flatMap((w) => w.contributionDays);
    const { currentStreak, longestStreak } = calculateStreaks(days);

    const svg = generateStreakSVG(calendar.totalContributions, currentStreak, longestStreak, resolvedTheme);

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    const serverErrorSvg = generateErrorSVG(
      "Internal Server Error",
      "Failed to fetch GitHub contributions",
      resolvedTheme.background,
      resolvedTheme.border
    );
    return new NextResponse(serverErrorSvg, {
      status: 500,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }
}
