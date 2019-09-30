var { parentPort, workerData } = require('worker_threads');
var fetch = require('node-fetch');

var Psql = require('./psql');
const ARCHIVE_URL = 'https://archive.vine.co/posts/';

workerData.forEach(async (vineId) => {
	let target = ARCHIVE_URL + vineId + '.json';
	//parentPort.postMessage(target);
	await fetch(target)
		.then((res) => {
			message(res.ok);
			if (res.ok) return res.json();
			else throw null;
		})
		.then((json) => datahandle(vineId, json))
		.catch(() => errorHandle(vineId));
});

function datahandle(vineId, json) {
	Psql.createScrape(vineId, true, true)
		.then((result) => result)
		.then(() => Psql.createVine(vineId, json))
		.catch((err) => parentPort.postMessage(err));
}

function errorHandle(vineId) {
	parentPort.postMessage(`Error with: ${vineId}`);
}

function message(msg) {
	parentPort.postMessage(msg);
}