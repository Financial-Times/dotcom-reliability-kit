const express = require('express');

const app = express();

app.use(express.static(__dirname));

const page = `
<!DOCTYPE html>
<html>
	<head>
		<title>Client Metrics Test</title>
	</head>
	<body>
		<p>Open console and do stuff with the metrics global variable.</p>
		<script src="./bundle.js"></script>
	</body>
</html>
`;

app.get('/', (_request, response) => {
	response.send(page);
});

app.listen(8080, () => {
	console.log('started');
});
