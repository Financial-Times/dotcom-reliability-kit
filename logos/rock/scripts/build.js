#!/usr/bin/env node
/* eslint-disable no-console */

const { mkdir, readFile, writeFile } = require('fs/promises');
const path = require('path');
const { optimize: optimizeSvg } = require('svgo');
const sharp = require('sharp');

(async () => {
	const dist = path.resolve(__dirname, '..', 'dist');
	const src = path.resolve(__dirname, '..', 'src');

	// Create the dist directory
	await mkdir(dist, { recursive: true });

	// Load and optimize the SVG
	const sourceSvgString = await readFile(path.join(src, 'logo.svg'), 'utf-8');
	// @ts-ignore
	const optimizedSvgString = optimizeSvg(sourceSvgString).data || '';

	// Save the optimized SVG
	console.log('Saving optimized SVG');
	await writeFile(path.join(dist, 'logo.svg'), optimizedSvgString);

	// Save the logo at different PNG sizes
	const pngSizes = [1024, 512, 256, 128];
	for (const size of pngSizes) {
		console.log(`Saving PNG at size ${size}`);
		await sharp(Buffer.from(optimizedSvgString))
			.resize(size)
			.png()
			.toFile(path.join(dist, `logo-${size}.png`));
	}
})().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
});
