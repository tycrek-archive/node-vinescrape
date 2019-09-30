var fs = require('fs-extra');
var path = require('path');

const VINE_ID_FILE = 'vine_ids_no_dupes.txt';
const ARCHIVE_URL = 'https://archive.vine.co/posts/';


// First check if the vine_ids.txt file exists
fs.pathExists(path.join(__dirname, VINE_ID_FILE))
	.then((exists) => {
		console.log(exists);
	})
	.catch((err) => console.error(err));
