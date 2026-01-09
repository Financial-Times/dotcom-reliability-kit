#!/usr/bin/env node
// biome-ignore-all lint/suspicious/noConsole: only used as part of the build

const { mkdir, readFile, writeFile } = require('node:fs/promises');
const path = require('node:path');
const { optimize: optimizeSvg } = require('svgo');
const sharp = require('sharp');

(async () => {
	const dist = path.resolve(__dirname, '..', 'dist');
	const src = path.resolve(__dirname, '..', 'src');

	// Create the dist directory
	await mkdir(dist, { recursive: true });

	// Build the logos
	await buildLogo('rock-color', [1024, 512, 256, 128]);
	await buildLogo('rock-with-cowboy-hat', [1024, 512, 256, 128]);
	await buildLogo('rock-mono', [128, 64, 32, 16]);
	await buildLogo('reliability-kit-color', [1552, 720]);

	/**
	 * Build logo assets.
	 *
	 * @param {string} name
	 *     The name of the logo within the `src` directory.
	 * @param {number[]} pngSizes
	 *     The pixel sizes to export PNG files at.
	 * @returns {Promise<void>}
	 */
	async function buildLogo(name, pngSizes) {
		// Load and optimize the SVG
		const filePath = path.join(src, `${name}.svg`);
		const svgString = optimizeSvg(await readFile(filePath, 'utf-8')).data || '';

		// Save the optimized SVG
		console.log(`🖼  ${name}: saving optimized SVG`);
		await writeFile(path.join(dist, `${name}.svg`), svgString);

		// Save the logo at different PNG sizes
		for (const size of pngSizes) {
			console.log(`↔️  ${name}: saving PNG at size ${size}`);
			await sharp(Buffer.from(svgString))
				.resize(size)
				.png()
				.toFile(path.join(dist, `${name}-${size}.png`));
		}
		console.log(`✅  ${name}: done\n`);
	}
})().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
});
