const express = require('express');
const nodeFetch = require('node-fetch');

/**
 * @returns {express.Application}
 */
exports.createTestApp = function createTestApp() {
	const app = express();

	app.get('/', async (request, response) => {
		// Native fetch
		const bulbasaur = await fetch(
			'https://pokeapi.co/api/v2/pokemon/bulbasaur'
		).then((response) => response.json());

		// Node fetch
		const squirtle = await nodeFetch(
			'https://pokeapi.co/api/v2/pokemon/squirtle'
		).then((response) => response.json());

		response.send(
			[
				`Bulbasaur has the types: ${bulbasaur.types.map(({ type }) => type.name).join(', ')}`,
				`Squirtle has the types: ${squirtle.types.map(({ type }) => type.name).join(', ')}`,
				''
			].join('\n')
		);
	});

	return app;
};
