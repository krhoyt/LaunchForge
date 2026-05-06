# LaunchForge Pipeline Agent

This directory contains the Claude Code agent for the LaunchForge creative automation pipeline. The agent transforms campaign brief JSON files into polished social media ad composites across three aspect ratios (1x1, 9x16, 16x9).

## Prerequisites

- **[Bun](https://bun.sh)** runtime (v1.0 or later)
- **OpenAI API key** with access to `gpt-image-1`
- **[Claude Code](https://claude.ai/code)** CLI

## Setup

**1. Install dependencies**

```bash
bun install
```

**2. Configure your API key**

Copy the example env file and add your key:

```bash
cp .env-example .env
```

Edit `.env`:

```
OPENAI_API_KEY=sk-...
```

**3. Install the agent**

Copy the agent file into Claude Code's commands directory:

```bash
mkdir -p .claude/commands
cp agent/run-pipeline.md .claude/commands/run-pipeline.md
```

## Running the Pipeline

Open Claude Code from the project root:

```bash
claude
```

Then invoke the pipeline:

```
/run-pipeline
```

Claude will process every `.json` file found in `input/briefs/` — one brief at a time, in sequence.

## Input Format

Place campaign brief JSON files in `input/briefs/`. See `input/briefs/play-anywhere.json` for a complete example. Required fields:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Campaign name |
| `market` | string | Target market (e.g., "United States") |
| `region` | string | Locale code (e.g., "en-US") |
| `audience` | string | Target audience description |
| `message` | string | Campaign tagline (≤ 120 characters recommended) |
| `products` | array | At least 2 products |
| `products[].name` | string | Product display name |
| `products[].asset` | string \| null | Filename in `input/products/`, or `null` to generate |
| `heroAsset` | string \| null | Filename in `input/products/`, or `null` to generate |
| `brandRules` | object | Colors, tone, visual style guidelines |
| `prohibitedTerms` | array | Words that must not appear in generated copy |

Place any provided product images in `input/products/`. Brand logos go in `input/brand/`.

## Output Structure

```
output/
├── generated/              AI-generated images (cached across runs)
│   ├── hero-background.png
│   └── {product-slug}.png
├── posts/                  Final composite images
│   └── {product-slug}/
│       ├── 1x1.png         1080×1080  — Feed / square
│       ├── 9x16.png        1080×1920  — Stories / vertical
│       └── 16x9.png        1920×1080  — Landscape
├── report-{brief}.json     Machine-readable run report
└── report-{brief}.md       Human-readable run report
```

## Asset Caching

Generated images are saved to `output/generated/` and **reused on subsequent runs**. The pipeline checks for existing files before calling the OpenAI API:

1. Checks `input/products/` for provided assets (highest priority)
2. Checks `output/generated/` for previously generated assets
3. Only calls OpenAI if neither source has the file

Delete files from `output/generated/` to force regeneration.

## Key Design Decisions

- **Claude as orchestrator:** The agent uses Claude's language model for copy generation (headlines per product × ratio) and delegates image generation and compositing to short-lived Bun scripts it writes on the fly.
- **Cache-first image generation:** Avoids redundant OpenAI API calls by checking disk before generating.
- **Brief isolation:** Errors in one brief do not stop other briefs from processing.
- **Self-contained scripts:** Each Bun script has all values baked in as literals — no runtime imports from the project.
- **SVG + Sharp compositing:** Text overlays are rendered as SVG (enabling native text wrapping via `<tspan>`) and composited onto images using Sharp. Layout zones are proportional (percentage-based) so they adapt cleanly to each aspect ratio.

## Assumptions & Limitations

- Localization is not implemented; copy is generated in English (`region` is noted but not acted on).
- Logo compositing is not implemented (logo path is read from `brandRules.logo` but not rendered).
- Legal/compliance checks are advisory warnings only; prohibited terms do not block output.
- The `sharp` package requires native bindings (libvips). On macOS: `brew install vips`. On Linux, Sharp typically bundles prebuilt binaries automatically.
