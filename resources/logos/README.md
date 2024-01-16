
# @dotcom-reliability-kit/logos

Logo images for [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

  * [Usage](#usage)
    * [Building optimised logos](#building-optimised-logos)
    * [Using the logos](#using-the-logos)
  * [Contributing](#contributing)
  * [License](#license)


## Usage

This module is not published to npm, it's purely used to store original logo files and to generate optimised images from them.

### Building optimised logos

Before you can build optimised logos, you need to make sure that the free [Roboto](https://en.wikipedia.org/wiki/Roboto) font is installed on your system. If it's not, [you can download it easily from Google Fonts here](https://fonts.google.com/specimen/Roboto) (click "Download family").

You can then generate all of the optimized logos by running the following from the _root_ folder of Reliability Kit:

```bash
npm run build:logos
```

This will generate optimized SVGs (run through [SVGO](https://github.com/svg/svgo#readme)) as well as PNG images at different sizes. This script is also run during `postinstall`, so running `npm i` in the root folder will also generate logo images.

### Using the logos

The following logos are available:

| Logo                                                     | Description                                                                |
|----------------------------------------------------------|----------------------------------------------------------------------------|
| [reliability-kit-color](./src/reliability-kit-color.svg) | The full colour rock alongside the text "FT.com Reliability Kit" in Roboto |
| [rock-color](./src/rock-color.svg)                       | The full colour rock, better displayed at 128px or higher                  |
| [rock-mono](./src/rock-mono.svg)                         | The mono-colour rock, better displayed at 64px or lower                    |


## Contributing

See the [central contributing guide for Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/contributing.md) for the basics. There are also some additional requirements for working with logos.

The original SVGs were built using [Boxy SVG](https://boxy-svg.com/), there's a [free web version available here](https://boxy-svg.com/app). There are hidden elements in a `_ Working` directory of each SVG which must remain hidden. This folder contains working resources, e.g. the original path for the rock or the text as text elements rather than paths.

When working with the SVGs:

  * Bear in mind the original intention behind the rock design, [documented in this PR](https://github.com/Financial-Times/dotcom-reliability-kit/pull/103).

  * Make sure that you copy any text and convert it to a path. This ensures that the text will display as expected regardless of whether the viewer's machine has the Roboto font available

  * Probably try to use Boxy SVG or edit the SVGs manually. Opening in Adobe Illustrator or Sketch or others will add a lot of extra metadata. If you do want to edit elsewhere, make sure to strip out any unwanted editor changes

  * Make changes to the coloured rock in the `rock-color` SVG, then copy all elements into `reliability-kit-color` when done. I tried to not make this a required step but I don't think there's a way around it

  * When you make changes, run the [build script](#building-optimised-logos) and manually verify that the logo is understandable and not too blurred at all the exported file sizes.


## License

Licensed under the [MIT](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/LICENSE) license.<br/>
Copyright &copy; 2022, The Financial Times Ltd.
