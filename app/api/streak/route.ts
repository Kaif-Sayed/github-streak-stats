import { NextRequest, NextResponse } from "next/server";

interface ContributionDay {
  contributionCount: number;
  date: string;
}

interface GraphQLResponse {
  data?: {
    user?: {
      createdAt?: string;
      contributionsCollection?: {
        contributionYears?: number[];
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
  stroke: string; // divider line color
  ring: string; // center circle stroke color
  fire: string; // flame icon color
  currStreakNum: string; // center streak number
  sideNums: string; // left & right numbers
  currStreakLabel: string; // center "Current Streak" label
  sideLabels: string; // left & right labels
  dates: string; // date range text color
}

export const THEMES: Record<string, StreakTheme> = {
  horizon: {
    name: "Horizon",
    background: "#1C1E26",
    border: "#1C1E26",
    stroke: "#FAB795",
    ring: "#E95678",
    fire: "#E95678",
    currStreakNum: "#59E1E3",
    sideNums: "#59E1E3",
    currStreakLabel: "#23BD87",
    sideLabels: "#23BD87",
    dates: "#FAB795",
  },
  cyberpunk: {
    name: "Cyberpunk",
    background: "#0D1117",
    border: "#30363D",
    stroke: "#30363D",
    ring: "#00F7FF",
    fire: "#7C3AED",
    currStreakNum: "#00F7FF",
    sideNums: "#00F7FF",
    currStreakLabel: "#00F7FF",
    sideLabels: "#8B949E",
    dates: "#8B949E",
  },
  dracula: {
    name: "Dracula",
    background: "#282A36",
    border: "#6272A4",
    stroke: "#6272A4",
    ring: "#FF79C6",
    fire: "#FFB86C",
    currStreakNum: "#50FA7B",
    sideNums: "#50FA7B",
    currStreakLabel: "#FF79C6",
    sideLabels: "#F8F8F2",
    dates: "#F8F8F2",
  },
  tokyonight: {
    name: "Tokyo Night",
    background: "#1A1B26",
    border: "#2F3549",
    stroke: "#2F3549",
    ring: "#70A5FD",
    fire: "#F7768E",
    currStreakNum: "#BF91F3",
    sideNums: "#70A5FD",
    currStreakLabel: "#BF91F3",
    sideLabels: "#70A5FD",
    dates: "#38BDAE",
  },
  "github-dark": {
    name: "GitHub Dark",
    background: "#0D1117",
    border: "#30363D",
    stroke: "#21262D",
    ring: "#238636",
    fire: "#F0883E",
    currStreakNum: "#3FB950",
    sideNums: "#3FB950",
    currStreakLabel: "#3FB950",
    sideLabels: "#8B949E",
    dates: "#8B949E",
  },
  nord: {
    name: "Nord",
    background: "#2E3440",
    border: "#4C566A",
    stroke: "#4C566A",
    ring: "#88C0D0",
    fire: "#BF616A",
    currStreakNum: "#8FBCBB",
    sideNums: "#8FBCBB",
    currStreakLabel: "#88C0D0",
    sideLabels: "#D8DEE9",
    dates: "#D8DEE9",
  },
  emerald: {
    name: "Emerald",
    background: "#061A14",
    border: "#064E3B",
    stroke: "#064E3B",
    ring: "#10B981",
    fire: "#F59E0B",
    currStreakNum: "#34D399",
    sideNums: "#34D399",
    currStreakLabel: "#10B981",
    sideLabels: "#A7F3D0",
    dates: "#A7F3D0",
  },
  sunset: {
    name: "Sunset",
    background: "#180D1C",
    border: "#4C1D4F",
    stroke: "#4C1D4F",
    ring: "#F43F5E",
    fire: "#E11D48",
    currStreakNum: "#FB923C",
    sideNums: "#FB923C",
    currStreakLabel: "#F43F5E",
    sideLabels: "#FDA4AF",
    dates: "#FDA4AF",
  },
  radical: {
    name: "Radical",
    background: "#141321",
    border: "#342E52",
    stroke: "#342E52",
    ring: "#FE428E",
    fire: "#FF6584",
    currStreakNum: "#F8D847",
    sideNums: "#FE428E",
    currStreakLabel: "#F8D847",
    sideLabels: "#FE428E",
    dates: "#A9FEF7",
  },
  "solarized-dark": {
    name: "Solarized",
    background: "#002B36",
    border: "#073642",
    stroke: "#073642",
    ring: "#268BD2",
    fire: "#CB4B16",
    currStreakNum: "#2AA198",
    sideNums: "#2AA198",
    currStreakLabel: "#268BD2",
    sideLabels: "#93A1A1",
    dates: "#93A1A1",
  },
  light: {
    name: "Light",
    background: "#FFFFFF",
    border: "#D0D7DE",
    stroke: "#E4E2E2",
    ring: "#FB8C00",
    fire: "#FB8C00",
    currStreakNum: "#151515",
    sideNums: "#151515",
    currStreakLabel: "#FB8C00",
    sideLabels: "#151515",
    dates: "#464646",
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

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatSingleDate(dateStr: string, includeYear = true): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const month = MONTH_NAMES[d.getUTCMonth()];
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();
  return includeYear ? `${month} ${day}, ${year}` : `${month} ${day}`;
}

function formatDateRange(startDateStr: string, endDateStr: string): string {
  if (!startDateStr || !endDateStr) return "No streak";
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return `${startDateStr} - ${endDateStr}`;

  const currentYear = new Date().getUTCFullYear();
  const startYear = start.getUTCFullYear();
  const endYear = end.getUTCFullYear();

  const startMonth = MONTH_NAMES[start.getUTCMonth()];
  const startDay = start.getUTCDate();
  const endMonth = MONTH_NAMES[end.getUTCMonth()];
  const endDay = end.getUTCDate();

  if (startYear !== endYear) {
    if (endYear === currentYear) {
      return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}`;
    }
    return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
  }

  if (startDateStr === endDateStr) {
    return startYear === currentYear ? `${startMonth} ${startDay}` : `${startMonth} ${startDay}, ${startYear}`;
  }

  if (startYear !== currentYear) {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
  }

  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
}

export interface CalculatedStreakData {
  totalContributions: number;
  totalContributionsRange: string;
  currentStreak: {
    length: number;
    start: string;
    end: string;
    range: string;
  };
  longestStreak: {
    length: number;
    start: string;
    end: string;
    range: string;
  };
}

function calculateStreaks(days: ContributionDay[], createdAtStr?: string): CalculatedStreakData {
  days.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let totalContributions = 0;
  let firstContributionDate = "";

  for (const day of days) {
    totalContributions += day.contributionCount;
    if (day.contributionCount > 0 && !firstContributionDate) {
      firstContributionDate = day.date;
    }
  }

  if (!firstContributionDate && createdAtStr) {
    firstContributionDate = createdAtStr.split("T")[0];
  }
  if (!firstContributionDate && days.length > 0) {
    firstContributionDate = days[0].date;
  }

  const totalContributionsRange = firstContributionDate
    ? `${formatSingleDate(firstContributionDate, true)} - Present`
    : "Present";

  // Longest streak
  let longestStreakLen = 0;
  let longestStart = "";
  let longestEnd = "";

  let tempStreak = 0;
  let tempStart = "";
  let tempEnd = "";

  for (const day of days) {
    if (day.contributionCount > 0) {
      if (tempStreak === 0) {
        tempStart = day.date;
      }
      tempStreak++;
      tempEnd = day.date;
      if (tempStreak > longestStreakLen) {
        longestStreakLen = tempStreak;
        longestStart = tempStart;
        longestEnd = tempEnd;
      }
    } else {
      tempStreak = 0;
      tempStart = "";
      tempEnd = "";
    }
  }

  // Current streak
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const reversedDays = [...days].reverse();
  const todayEntry = reversedDays.find((d) => d.date === today);
  const yesterdayEntry = reversedDays.find((d) => d.date === yesterday);

  let currentStreakLen = 0;
  let currentStart = "";
  let currentEnd = "";

  let startIndex = -1;
  if (todayEntry && todayEntry.contributionCount > 0) {
    startIndex = reversedDays.indexOf(todayEntry);
    currentEnd = todayEntry.date;
  } else if (yesterdayEntry && yesterdayEntry.contributionCount > 0) {
    startIndex = reversedDays.indexOf(yesterdayEntry);
    currentEnd = yesterdayEntry.date;
  }

  if (startIndex !== -1) {
    for (let i = startIndex; i < reversedDays.length; i++) {
      if (reversedDays[i].contributionCount > 0) {
        currentStreakLen++;
        currentStart = reversedDays[i].date;
      } else {
        break;
      }
    }
  }

  return {
    totalContributions,
    totalContributionsRange,
    currentStreak: {
      length: currentStreakLen,
      start: currentStart,
      end: currentEnd,
      range: currentStreakLen > 0 ? formatDateRange(currentStart, currentEnd) : "No active streak",
    },
    longestStreak: {
      length: longestStreakLen,
      start: longestStart,
      end: longestEnd,
      range: longestStreakLen > 0 ? formatDateRange(longestStart, longestEnd) : "None",
    },
  };
}

function generateErrorSVG(title: string, message: string, bg = "#1C1E26", border = "#1C1E26") {
  return `
  <svg width="495" height="195" viewBox="0 0 495 195" fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>
      .bg { fill: ${bg}; rx: 10px; }
      .err-title { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 700; font-size: 18px; fill: #F87171; }
      .err-desc { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 400; font-size: 13px; fill: #8B949E; }
    </style>
    <rect width="495" height="195" class="bg" stroke="${border}" stroke-width="1" />
    <circle cx="247.5" cy="62" r="22" fill="#3B1219" stroke="#DC2626" stroke-width="1.5" />
    <text x="247.5" y="69" text-anchor="middle" font-size="18" fill="#F87171" font-weight="bold">!</text>
    <text x="247.5" y="112" text-anchor="middle" class="err-title">${title}</text>
    <text x="247.5" y="138" text-anchor="middle" class="err-desc">${message}</text>
  </svg>
  `;
}

export interface RenderTheme {
  background: string;
  border: string;
  stroke: string;
  ring: string;
  fire: string;
  currStreakNum: string;
  sideNums: string;
  currStreakLabel: string;
  sideLabels: string;
  dates: string;
  hideBorder: boolean;
  radius: number;
}

function generateStreakSVG(stats: CalculatedStreakData, theme: RenderTheme) {
  const borderAttr = theme.hideBorder ? "" : `stroke="${theme.border}" stroke-width="1"`;

  return `
  <svg width="495" height="195" viewBox="0 0 495 195" fill="none" xmlns="http://www.w3.org/2000/svg" style="isolation: isolate;">
    <defs>
      <!-- Outer Card Rounded Clip -->
      <clipPath id="card_clip">
        <rect width="495" height="195" rx="${theme.radius}" />
      </clipPath>

      <!-- Mask to cut out top of ring where fire sits -->
      <mask id="mask_fire_cutout">
        <rect width="495" height="195" fill="white" />
        <ellipse cx="247.5" cy="31" rx="14" ry="18" fill="black" />
      </mask>

      <!-- Number Scroll Viewport ClipPaths -->
      <clipPath id="clip_total_num">
        <rect x="5" y="46" width="155" height="38" />
      </clipPath>
      <clipPath id="clip_current_num">
        <rect x="180" y="46" width="135" height="38" />
      </clipPath>
      <clipPath id="clip_longest_num">
        <rect x="335" y="46" width="155" height="38" />
      </clipPath>
    </defs>

    <style>
      .stat-font {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Ubuntu, Roboto, "Helvetica Neue", sans-serif;
      }
      .title {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Ubuntu, Roboto, "Helvetica Neue", sans-serif;
        font-weight: 700;
        font-size: 28px;
      }
      .side-label {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Ubuntu, Roboto, "Helvetica Neue", sans-serif;
        font-weight: 400;
        font-size: 14px;
        fill: ${theme.sideLabels};
      }
      .curr-label {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Ubuntu, Roboto, "Helvetica Neue", sans-serif;
        font-weight: 700;
        font-size: 14px;
        fill: ${theme.currStreakLabel};
      }
      .date-text {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Ubuntu, Roboto, "Helvetica Neue", sans-serif;
        font-weight: 400;
        font-size: 12px;
        fill: ${theme.dates};
      }
      .divider-line {
        stroke: ${theme.stroke};
        stroke-width: 1;
        stroke-linecap: square;
      }

      /* 5-SECOND LOOP ANIMATION FOR THE CIRCLE */
      @keyframes circle-draw {
        0% {
          stroke-dashoffset: 252;
          opacity: 0.15;
        }
        20% {
          stroke-dashoffset: 0;
          opacity: 1;
        }
        85% {
          stroke-dashoffset: 0;
          opacity: 1;
        }
        93% {
          stroke-dashoffset: 0;
          opacity: 0.2;
        }
        100% {
          stroke-dashoffset: 252;
          opacity: 0.15;
        }
      }

      .animated-circle {
        stroke: ${theme.ring};
        stroke-width: 4.5;
        stroke-dasharray: 252;
        stroke-linecap: round;
        transform-origin: 247.5px 71px;
        transform: rotate(-90deg);
        animation: circle-draw 5s ease-in-out infinite;
      }

      /* 5-SECOND LOOP ANIMATION FOR FLAME POP */
      @keyframes flame-fade {
        0% {
          opacity: 0.2;
        }
        15% {
          opacity: 1;
        }
        85% {
          opacity: 1;
        }
        93% {
          opacity: 0.2;
        }
        100% {
          opacity: 0.2;
        }
      }

      .animated-flame {
        animation: flame-fade 5s ease-in-out infinite;
      }

      /* 5-SECOND LOOP NUMBER SCROLL (STAGGERED ROLL IN) */
      @keyframes scroll-left {
        0% {
          transform: translateY(38px);
          opacity: 0;
        }
        4% {
          opacity: 0.3;
        }
        16% {
          transform: translateY(0);
          opacity: 1;
        }
        85% {
          transform: translateY(0);
          opacity: 1;
        }
        93% {
          transform: translateY(-38px);
          opacity: 0;
        }
        97% {
          transform: translateY(38px);
          opacity: 0;
        }
        100% {
          transform: translateY(38px);
          opacity: 0;
        }
      }

      @keyframes scroll-center {
        0%, 3% {
          transform: translateY(38px);
          opacity: 0;
        }
        7% {
          opacity: 0.3;
        }
        20% {
          transform: translateY(0);
          opacity: 1;
        }
        85% {
          transform: translateY(0);
          opacity: 1;
        }
        93% {
          transform: translateY(-38px);
          opacity: 0;
        }
        97% {
          transform: translateY(38px);
          opacity: 0;
        }
        100% {
          transform: translateY(38px);
          opacity: 0;
        }
      }

      @keyframes scroll-right {
        0%, 6% {
          transform: translateY(38px);
          opacity: 0;
        }
        10% {
          opacity: 0.3;
        }
        24% {
          transform: translateY(0);
          opacity: 1;
        }
        85% {
          transform: translateY(0);
          opacity: 1;
        }
        93% {
          transform: translateY(-38px);
          opacity: 0;
        }
        97% {
          transform: translateY(38px);
          opacity: 0;
        }
        100% {
          transform: translateY(38px);
          opacity: 0;
        }
      }

      .scroll-left-group {
        animation: scroll-left 5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
      }
      .scroll-center-group {
        animation: scroll-center 5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
      }
      .scroll-right-group {
        animation: scroll-right 5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
      }
    </style>

    <g clip-path="url(#card_clip)">
      <!-- Background Card -->
      <rect width="495" height="195" fill="${theme.background}" ${borderAttr} rx="${theme.radius}" />

      <!-- Vertical Dividers -->
      <line x1="165" y1="28" x2="165" y2="170" class="divider-line" />
      <line x1="330" y1="28" x2="330" y2="170" class="divider-line" />

      <!-- ================= 1. TOTAL CONTRIBUTIONS (LEFT) ================= -->
      <g>
        <!-- Scrolling Number -->
        <g clip-path="url(#clip_total_num)">
          <g class="scroll-left-group">
            <text x="82.5" y="76" text-anchor="middle" class="title" fill="${theme.sideNums}">
              ${stats.totalContributions.toLocaleString()}
            </text>
          </g>
        </g>
        <!-- Label -->
        <text x="82.5" y="112" text-anchor="middle" class="side-label">
          Total Contributions
        </text>
        <!-- Date Range -->
        <text x="82.5" y="142" text-anchor="middle" class="date-text">
          ${stats.totalContributionsRange}
        </text>
      </g>

      <!-- ================= 2. CURRENT STREAK (CENTER HIGHLIGHT) ================= -->
      <g>
        <!-- Animated Circle Ring with Flame Mask -->
        <g mask="url(#mask_fire_cutout)">
          <circle cx="247.5" cy="71" r="40" fill="none" class="animated-circle" />
        </g>

        <!-- Flame Icon at Top of Ring -->
        <g transform="translate(247.5, 19.5)" class="animated-flame">
          <path d="M -12 -0.5 L 15 -0.5 L 15 23.5 L -12 23.5 L -12 -0.5 Z" fill="none" />
          <path d="M 1.5 0.67 C 1.5 0.67 2.24 3.32 2.24 5.47 C 2.24 7.53 0.89 9.2 -1.17 9.2 C -3.23 9.2 -4.79 7.53 -4.79 5.47 L -4.76 5.11 C -6.78 7.51 -8 10.62 -8 13.99 C -8 18.41 -4.42 22 0 22 C 4.42 22 8 18.41 8 13.99 C 8 8.6 5.41 3.79 1.5 0.67 Z M -0.29 19 C -2.07 19 -3.51 17.6 -3.51 15.86 C -3.51 14.24 -2.46 13.1 -0.7 12.74 C 1.07 12.38 2.9 11.53 3.92 10.16 C 4.31 11.45 4.51 12.81 4.51 14.2 C 4.51 16.85 2.36 19 -0.29 19 Z" fill="${theme.fire}" />
        </g>

        <!-- Scrolling Number Inside Circle -->
        <g clip-path="url(#clip_current_num)">
          <g class="scroll-center-group">
            <text x="247.5" y="78" text-anchor="middle" class="title" fill="${theme.currStreakNum}">
              ${stats.currentStreak.length}
            </text>
          </g>
        </g>

        <!-- Label -->
        <text x="247.5" y="136" text-anchor="middle" class="curr-label">
          Current Streak
        </text>

        <!-- Date Range -->
        <text x="247.5" y="166" text-anchor="middle" class="date-text">
          ${stats.currentStreak.range}
        </text>
      </g>

      <!-- ================= 3. LONGEST STREAK (RIGHT) ================= -->
      <g>
        <!-- Scrolling Number -->
        <g clip-path="url(#clip_longest_num)">
          <g class="scroll-right-group">
            <text x="412.5" y="76" text-anchor="middle" class="title" fill="${theme.sideNums}">
              ${stats.longestStreak.length}
            </text>
          </g>
        </g>
        <!-- Label -->
        <text x="412.5" y="112" text-anchor="middle" class="side-label">
          Longest Streak
        </text>
        <!-- Date Range -->
        <text x="412.5" y="142" text-anchor="middle" class="date-text">
          ${stats.longestStreak.range}
        </text>
      </g>
    </g>
  </svg>
  `;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawUser = searchParams.get("user");
  const username = rawUser && rawUser.trim() ? rawUser.trim() : "KaifSayed";

  // Default theme is now horizon (matches user's screenshot)
  const themeKey = (searchParams.get("theme") || "horizon").toLowerCase();
  const baseTheme = THEMES[themeKey] || THEMES.horizon;

  const bgParam = searchParams.get("bg") || searchParams.get("background");
  const borderParam = searchParams.get("border");
  const strokeParam = searchParams.get("stroke");
  const ringParam = searchParams.get("ring");
  const fireParam = searchParams.get("fire");
  const currStreakNumParam = searchParams.get("currStreakNum") || searchParams.get("curr_streak_num");
  const sideNumsParam = searchParams.get("sideNums") || searchParams.get("side_nums") || searchParams.get("text") || searchParams.get("color");
  const currStreakLabelParam = searchParams.get("currStreakLabel") || searchParams.get("curr_streak_label");
  const sideLabelsParam = searchParams.get("sideLabels") || searchParams.get("side_labels") || searchParams.get("label");
  const datesParam = searchParams.get("dates") || searchParams.get("date");
  const hideBorder = searchParams.get("hide_border") === "true";
  const radiusParam = searchParams.get("radius");
  const radius = radiusParam !== null ? Math.max(0, Math.min(40, parseInt(radiusParam, 10) || 10)) : 10;

  const resolvedTheme: RenderTheme = {
    background: sanitizeColor(bgParam, baseTheme.background),
    border: sanitizeColor(borderParam, baseTheme.border),
    stroke: sanitizeColor(strokeParam, baseTheme.stroke),
    ring: sanitizeColor(ringParam, baseTheme.ring),
    fire: sanitizeColor(fireParam, baseTheme.fire),
    currStreakNum: sanitizeColor(currStreakNumParam, baseTheme.currStreakNum),
    sideNums: sanitizeColor(sideNumsParam, baseTheme.sideNums),
    currStreakLabel: sanitizeColor(currStreakLabelParam, baseTheme.currStreakLabel),
    sideLabels: sanitizeColor(sideLabelsParam, baseTheme.sideLabels),
    dates: sanitizeColor(datesParam, baseTheme.dates),
    hideBorder,
    radius,
  };

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    const errorSvg = generateErrorSVG(
      "GITHUB_TOKEN Not Configured",
      "Add GITHUB_TOKEN to your .env file",
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
        createdAt
        contributionsCollection {
          contributionYears
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
        "User-Agent": "github-streak-stats",
      },
      body: JSON.stringify({ query, variables: { username } }),
      next: { revalidate: 3600 },
    });

    const json: GraphQLResponse = await response.json();

    const userObj = json.data?.user;
    const calendar = userObj?.contributionsCollection?.contributionCalendar;
    if (!calendar || !userObj) {
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
    const streakStats = calculateStreaks(days, userObj.createdAt);

    if (calendar.totalContributions && calendar.totalContributions > streakStats.totalContributions) {
      streakStats.totalContributions = calendar.totalContributions;
    }

    const svg = generateStreakSVG(streakStats, resolvedTheme);

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
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
