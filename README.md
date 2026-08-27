# GitHub Streak Stats 🔥

A dynamic, high-performance streak badge generator for your GitHub profile README. Generates sleek SVG cards displaying your total contributions, active streak, and longest streak.

## Features

- ⚡ **Zero-Dependency SVG**: Generates pure, lightweight SVG cards at runtime without heavy canvas or puppeteer dependencies.
- 🛡️ **Edge Caching**: Edge cached with `stale-while-revalidate` to avoid GitHub API rate limits.
- 🔥 **Accurate Streak Logic**: Properly accounts for ongoing day commits vs yesterday to ensure active streaks are preserved.
- 🎨 **10 Curated Themes & Custom Colors**: Pick from presets like Cyberpunk, Dracula, Tokyo Night, Nord, or pick your own custom hex colors for background, rings, numbers, and borders.
- 💻 **Split-Screen Studio**: Live interactive preview with instant Markdown and HTML snippet generation.

## Quick Start

### 1. Configure Environment

Create a `.env.local` file in the root directory:

```env
GITHUB_TOKEN=ghp_your_personal_access_token_here
```

> Create a GitHub Personal Access Token (classic or fine-grained) at [github.com/settings/tokens](https://github.com/settings/tokens) with `read:user` (or `public_repo`) scope.

### 2. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the generator studio.

## API Usage

### Endpoint

```http
GET /api/streak?user={username}&theme={theme}
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `user` | `string` | `KaifSayed` | GitHub username to fetch stats for |
| `theme` | `string` | `cyberpunk` | Preset theme name (see below) |
| `bg` | `string` | - | Custom background hex (e.g. `0D1117`) |
| `border` | `string` | - | Custom border hex (e.g. `30363D`) |
| `stroke` | `string` | - | Custom streak ring & highlight hex (e.g. `00F7FF`) |
| `text` | `string` | - | Custom stats numbers hex (e.g. `00F7FF`) |
| `fire` | `string` | - | Custom active flame badge hex (e.g. `7C3AED`) |
| `label` | `string` | - | Custom label text hex (e.g. `8B949E`) |
| `radius` | `number` | `12` | Corner radius in px (0 to 40) |
| `hide_border` | `boolean` | `false` | Set to `true` to omit the outer border |

### Supported Themes

`cyberpunk`, `dracula`, `tokyonight`, `github-dark`, `nord`, `emerald`, `sunset`, `radical`, `solarized-dark`, `light`

### Markdown Embed Example

```markdown
[![GitHub Streak](https://your-domain.com/api/streak?user=KaifSayed&theme=tokyonight)](https://github.com/KaifSayed)
```

### HTML Embed Example

```html
<a href="https://github.com/KaifSayed">
  <img src="https://your-domain.com/api/streak?user=KaifSayed&theme=tokyonight" alt="GitHub Streak" />
</a>
```
