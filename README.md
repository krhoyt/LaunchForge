# LaunchForge

LaunchForge was created to optimize media product workflows for marketing campaigns at scale. It leverages generative AI where possible to create media assets that may not be otherwise available. Compositing of assets into final post images is also automated across various ratios.

> Jump to [installation](#installation) instructions

## Purpose

A global consumer goods company launches hundreds of localized social ad campaigns monthly. 

## Input

LaunchForge requires that several artifacts be described and/or are present in order to automate the creative workflow. 

- **Directory structure:** A specific directory structure is required for operation. The directory structure - as well as asset presence - is checked as part of the workflow. The workflow will stop if structures or assets that are critical to the process are missing.  
- **Campaign brief:** The main driver of the workflow is one or more campaign briefs as described in JSON format. 
- **Product images:** Product images should be provided prior to running the workflow. Product images not provided will be generated based on their description.
- **Hero image:** A larger generic image used as the background for generated media assets. A missing hero image will be generated based on campaign description.

### Directory Structure

```
├── .env                    OpenAI API key goes here
├── input/                  Source directory for all input materials
│   ├── brand/              Corporate logos (if present)
│   ├── briefs/             One or more JSON formatted campaign briefs
│   └── products/           Product images as needed by the brief
└── output/                 All generated assets will go here
    ├── generated/          Any generated images required by the workflow
    └── posts/              Media organized by campaign brief
        └── [product]       One or more product directories for media output
```

> Any other directories or files are not part of the workflow.

### Campaign Brief

```
{
  "name": "My Campaign Name",
  "brand": "The Brand",
  "market": "United States",
  "region": "en-US",
  "audience": "Open description - useful to include age range",
  "message": "Main campaign message",
  "products": [
    {
      "name": "Product Name",
      "positioning": "Product/market fit",
      "features": [
        "Compelling",
        "Interesting",
        "Technical",
        "etc."
      ],
      "asset": "product-photo-w-transparent-background.png"
    }, {
      ... Must have at least two products
    }
  ],
  "heroAsset": "File name or null for generative output",
  "brandRules": {
    "colors": ["#7C3AED", "#111827", "#F9FAFB"],
    "tone": "playful, nostalgic, modern",
    "logo": "logo.png",
    "visualStyle": "Clean product photography",
    "background": "Light neutral gradient",
    "composition": "Centered product with details",
    "negative": [
      "no text",
      "no watermarks",
      "no third-party logos",
      "no copyrighted characters"
    ],    
    "requiredDisclaimer": "Legal notice"
  },
  "prohibitedTerms": [
    "Words",
    "Media Copy",
    "Should Not",
    "Have"
  ]
}
```
> You can put one or more campaign briefs into the "briefs" directory at any given time.

### Product Images

If you are providing product images they should be high enough in resolution to support large displays. One product image per product entry in the campaign brief is supported. While not required, consider providing product images with a transparent background to maximize use in compositing media assets.

### Hero Image

When compositing media assets, an image large enough to cover the entire destination resolution - called a "hero" - will be used to provide a background for the resulting images.  If you do not provide a hero image, one will be generated for you based on the campaign description.

> Any generated assets will be placed in the "./output/generated" folder. This workflow will reuse generated assets whenever possible.

## Output

There are two different types of images created by the workflow. One type of image is generated using AI, and represents otherwise missing assets. The other type of image is a composite of specific assets and descriptions as specified by the campaign brief. This second type of image will be produced in various sizes (1:1, 9:16, 16:9), and named according to those size. These assets will be placed in folders organized by product name.

```
./output/posts/product-name-1/1x1.png
./output/posts/product-name-1/9x16.png
./output/posts/product-name-1/16x9.png
./output/posts/product-name-2/1x1.png
./output/posts/product-name-2/9x16.png
./output/posts/product-name-2/16x9.png
```

A report in JSON format is also created by this workflow and placed in the root of the  `output` folder. 

The workflow will also log output along the way and report any errors or warnings. In the case of multiple briefs, if there is an error in one brief, processing on the brief, and only that brief, will stop. The workflow will then continue on to the next breif. I also just want to see how many times I can type the word "brief". Warnings do not interrupt the workflow and will be displayed upon completion.

> The application itself will terminate with `0` for success and `1` if errors were found (for CICD completeness).

## Process

The worflow consists of six discrete steps.

- **Read:** Check for required folders to be present
- **Parse:** Ensure the campaign JSON does not have errors and is well-formed
- **Validate:** Validate the campaign JSON fields; checks for reusable assets
- **Generate:** Leverage generative AI to create missing campaign assets
- **Compose:** Place and size labels and assets for target display requirements
- **Report:** Produce report data file for review

## Design Decisions

### Bun

The JavaScript runtime, Bun, was chosen for this project. I would love to say that there was some strategic purpose behind that selection, but it was made because I had been wanting to experiment with Bun for some time. It reminds me of jQuery or maybe "lodash" (if you have been around for a while) in its departure from Node. Where in Node you are either going low-level or installing a package, Bun knows about the world it is operating in and gives you a hand. JSX is built in. Web server? Included. S3, image processing, SQLite, and so many other tools we have come to expect are all core to Bun. Bun can also compile to native executables. It is just a whole, helping, lot of fun.

### Context/State

The entire workflow is built around a context object representing state. All inputs are considered immutable - product/campaign description, assets, etc. Missing assets that are generated for completeness are placed into the `output` folder. A fresh context object is created for each brief. The context object is passed to each of the steps in the process, where it is modified by reference. The context object is also returned from each step to allow for future use. When reporting is generated at the end of each brief process, the report uses a paired down version of the context object, not the whole context. 

### Others

- **Reuse:** Wherever possible reuse of input assets has been maximized
- **OpenAI:** Image generation is done against the OpenAI Image API (key in .env)
- **Canvas:** The Canvas API (yeah, like in the browser) is used to composite images
- **Ratios:** Output image ratios are in the `lib/config.js` and can be easily expanded
- **JSON:** Campaign briefs are described using JSON with heavy validation for required fields
- **Hero:** Hero image is generated if not present

### Campaign Brief

This application supports more than one brief - I mean, it was one more loop to add, so why not? Briefs must be in JSON format. The validity of the document and required fields is fully validated - often repeatedly, just in case - throughout the workflow.

## Assumptions and Limitations

Oh, I am very sure I made some of those...

- **Localization:** Not implemented, but the brief JSON file is set up to take that next step
- **Legal checks:** The brief JSON has a field for prohibited words, but the feature is not implemented
- **Logo:** Logo compositing is not implemented. The brief JSON does specify a `logo` field for future use
- **Build:** I really wanted to hand-off an executable to avoid requiring dependecies to run

## Installation

**Install [Bun](https://bun.com/)**

```
Mac/Linux:
curl -fsSL https://bun.sh/install | bash

Windows:
powershell -c "irm bun.sh/install.ps1 | iex"
```

**Install dependencies**

```
bun install
```

**OpenAI API key** can be in a .env as `OPENAI_API_KEY` or `export` if you prefer.

**Create `output` directory** - it is empty at start, not included by git.

**Run workflow**

```
bun run index.js
```

To **reset** the workflow, delete everything inside of `./output`.
