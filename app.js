var fs = require('fs-extra');
var path = require('path');
var fetch = require('node-fetch');

var Psql = require('./psql');

const ARCHIVE_URL = 'https://archive.vine.co/posts/';
const VINE_ID_URL = 'https://do-space.jmoore.dev/vine_ids_no_dupes.txt';
const VINE_ID_FILE = path.join(__dirname, 'vine_ids_no_dupes.txt');

// First check if the vine_ids.txt file exists
fs.pathExists(VINE_ID_FILE)
	.then((exists) => exists ? readVineIds() : downloadVineIds())
	.catch((err) => console.error(err));

function downloadVineIds() {
	fetch(VINE_ID_URL)
		.then((res) => res.text())
		.then((text) => (fs.writeFile(VINE_ID_FILE, text), text))
		.then((ids) => Main(ids));
}

function readVineIds() {
	fs.readFile(VINE_ID_FILE)
		.then((bytes) => bytes.toString())
		.then((ids) => Main(ids))
		.catch((err) => console.error(err));
}

function Main(ids) {
	singleWorker(ids);
}

function singleWorker(ids) {
	//ids.split('\r\n').forEach((vineId) => {});
	scrape(shuffle(ids.split('\r\n')));
}

function scrape(ids) {
	let vineId = ids.shift();
	let target = ARCHIVE_URL + vineId + '.json';
	Psql.getScrape(vineId)
		.then((result) => result.rowCount)
		.then((count) => {
			if (count == 0) return target;
			else throw 'Already scraped';
		})
		.then((target) => fetch(target))
		.then((res) => res.json())
		.then((json) => dataHandle(vineId, json))
		.catch((err) => errorHandle(vineId, err))
		.catch((err) => console.error(err))
		.then(() => scrape(ids));
}

function dataHandle(vineId, json) {
	return new Promise((resolve, reject) => {
		console.log(`Vine ${vineId} fetched`);
		Psql.createScrape(vineId, true, true)
			.then(() => Psql.createVine(vineId, json))
			.then(() => resolve())
			.catch((err) => reject(err));
	});
}

function errorHandle(vineId, err) {
	return new Promise((resolve, reject) => {
		console.log(`! Vine ${vineId} encountered an error: ${err}`);
		Psql.getScrape(vineId)
			.then((result) => result.rowCount)
			.then((count) => {
				if (count == 0) return;
				else throw null;
			})
			.then(() => Psql.createScrape(vineId, true, false))
			.then(() => resolve())
			.catch((err) => reject(err));
	});
}

/**
 * Shuffle array in place. ES6 version
 * @param {Array} a items An array containing items
 * https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
 */
function shuffle(a) {
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}