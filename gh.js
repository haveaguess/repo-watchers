var github;
var connection;

function init() {
	initdb();
	initgit();
}

function initdb() {
	var mysql      = require('mysql');
	connection = mysql.createConnection({
	  host     : 'localhost',
	  port     : '1441',
	  user     : 'root',
	  password : 'secretstatus',
	  database : 'stackoverflow',
	});

	connection.connect();
}


function initgit() {
	var GitHubApi = require("github");
	github = new GitHubApi({
	    // required
	    version: "3.0.0",
	    // optional
	    timeout: 5000
	});

	github.authenticate({
	    type: "basic",
	    username: "haveaguess",
	    password: "dapper"
	});
}

function cleanup() {
	connection.end();
	process.exit(0);
}



function handleErrors(err) {
	if (err) {
	    console.log('error! ' + err);
	    return false;
	} else {
		return true;
	}

}

function getRepo(user) {

	var query = connection.query('INSERT INTO `github-repos` SET ?', user, function(err, result) {
			console.log(err);
			console.log(result);
  			// Neat!
	});
}

function getUser(login, callback) {

	var query = {
	   "user": login
	};

	github.user.getFrom(query, function(err, res) {
		if (handleErrors(err)) {
			console.log("res[0] "+ res);
			console.log("res[0] "+ res[0]);

			//remove meta data 
			delete res.meta;
			
			callback(res);
		}
	});
}


function iterateResult(res, callback) {

	for (var i=0;i<res.length;i++) {
		var row="";
		var header="";
		var data=res[i];

		callback(data);
	}
}

// Neat!
function persistJson(table, json) {
	console.log("json is " + JSON.stringify(json, undefined, 2));

	var sql = 'INSERT INTO ' + table + ' SET ?';

	console.log("sql is " + sql);

	var query = connection.query(sql, json, function(err, result) {
		if (handleErrors(err)) {
			console.log(result);
		}
	});
}


var currentPage = 0;

function go() {
	init();

	//github.user.getFollowingFromUser(query, dbcallback);
	getWatchers(0);
}

function getWatchers(page) {
	if (page > 1) {
		return;
	}

	var query = {
	   "user": "symfony" ,
	   "repo": "symfony" ,
	   "page": currentPage
	};

	console.log("query is " + query.user);
	console.log("query is " + query.repo);
	console.log("query is " + query.page);

	// persist watchers
	github.repos.getWatchers(query, function(err, res) {
		if (handleErrors(err)) {

			// request full user info and persist
			iterateResult(res, function(data) {
				getUser(data.login, function(user) {
					persistJson('github', user);			
				});
			});

			page++;
			getWatchers(page);
		}
	});
}

go();








//unused
function querytest() {
		connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
	  if (err) throw err;

	  console.log('The solution is: ', rows[0].solution);
	});

}