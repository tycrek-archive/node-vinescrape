const { Pool } = require('pg');
var fs = require('fs-extra');

var pool = new Pool({
	connectionString: fs.readJsonSync('auth.json').psql
});

exports.createScrape = (vineId, scraped, success) => {
	let q = `INSERT INTO scrapes(
		vineid, scraped, success
		) VALUES ($1, $2, $3);
		`;
	return query(q, [vineId, scraped, success]);
}

exports.createVine = (vineId, json) => {
	let values = [
		json.username,
		json.userIdStr,
		json.postId,
		json.verified,
		json.description,
		json.created,
		json.permalinkUrl,
		json.userId,
		json.vanityUrls,
		json.entities,
		json.postIdStr,
		json.comments,
		json.reposts,
		json.loops,
		json.likes,
		json.videolowurl,
		json.videourl,
		json.videodashurl,
		json.thumbnailurl,
		vineId
	];
	let q = `INSERT INTO vines(
		username,
		useridstr,
		postid,
		verified,
		description,
		created,
		permalinkurl,
		userid,
		vanityurls,
		entities,
		postidstr,
		comments,
		reposts,
		loops,
		likes,
		videolowurl,
		videourl,
		videodashurl,
		thumbnailurl,
		vineid
	) VALUES(
		$1,
		$2,
		$3,
		$4,
		$5,
		$6,
		$7,
		$8,
		$9,
		$10,
		$11,
		$12,
		$13,
		$14,
		$15,
		$16,
		$17,
		$18,
		$19,
		$20
		);
		`;
	return query(q, values);
}

exports.getScrape = (vineId) => {
	let q = 'SELECT * FROM scrapes WHERE vineid = $1;';
	return query(q, [vineId]);
}

function query(text, values) {
	return new Promise((resolve, reject) => {
		let q = {
			text: text,
			values: values
		};
		pool.query(q)
			.then((result) => resolve(result))
			.catch((err) => reject(err));
	});
}