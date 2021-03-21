var express = require("express");
var bodyParser = require("body-parser");
var session = require('express-session');
var path = require('path');
const mongoose = require('mongoose');

//mongoose.connect('mongodb+srv://cdCENTIXO:gw2ksoft@cluster0.6vkmg.mongodb.net/dbCENTIXO?retryWrites=true&w=majority');
//mongoose.connect('mongodb://127.0.0.1:27017/MyDB');
const { MongoClient } = require('mongodb');


/**
 * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
 * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
 */
const uri = "mongodb+srv://cdCENTIXO:gw2ksoft@cluster0.6vkmg.mongodb.net/dbCENTIXO?retryWrites=true&w=majority";
const bcrypt = require('bcrypt');
const saltRounds = 10;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

try {
	// Connect to the MongoDB cluster
	client.connect();

	// Make the appropriate DB calls
	//await  listDatabases(client);
	// await createListing(
	// 	client,
	// 	{
	// 		name: "Lovely Loft",
	// 		summary: "A charming loft in paris",
	// 		bedrooms: 1,
	// 		bathrooms: 1
	// 	}
	// );
	//await findListingByName(client, "Lovely Loft");

	var app = express();

	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());

	app.get('/', function (request, response) {
		response.sendFile(path.join(__dirname + '/views/login.html'));
	});

	app.post('/auth', async function (request, response) {
		var username = request.body.username;
		var password = request.body.password;

		console.log(username);
		console.log(password);
		
		try {
			const results = await client.db("dbCENTIXO").collection("details").findOne({ name: username});
			console.log(results.password);
			myPlaintextPassword = request.body.password;
			
			if (bcrypt.compareSync(myPlaintextPassword, results.password)) {
				console.log(`Found a listing in the collection with name '${username}'`);
				//console.log(results);
				response.sendFile(__dirname + '/views/signup_success.html');
			} else {
				console.log(`No listings found with the name '${username}'`);
				response.sendFile(__dirname + '/views/register.html');
			}
		} catch (e) {
			console.error(e);
		}
	});
	app.post('/sign_up', async function (request, response) {
		var username = request.body.name;
		var email = request.body.email;
		var password = request.body.password;
		var phone = request.body.phone;

		bcrypt.hash(password, saltRounds, async function (err, hash) {
			// Store hash in your password DB.


			const results = await client.db("dbCENTIXO").collection("details").insertOne({ name: username, email: email, password: hash, phone: phone });
			console.log(`New listing created with following ID: ${results.insertedId}`);
			response.sendFile(__dirname + '/views/login.html');
		});
	});
	app.listen(3000);


} catch (e) {
	console.error(e);
}



async function listDatabases(client) {
	const databasesList = await client.db().admin().listDatabases();

	console.log("Databases:");
	databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

async function createListing(client, newListing) {
	const results = await client.db("sample_airbnb").collection("listingAndReviews").insertOne(newListing);
	console.log(`New listing created with following ID: ${results.insertedId}`);
};

async function findListingByName(client, nameOfListing) {
	const results = await client.db("sample_airbnb").collection("listingAndReviews").findOne({ name: nameOfListing });
	if (results) {
		console.log(`Found a listing in the collection with name '${nameOfListing}'`);
		console.log(results);
	} else {
		console.log(`No listings found with the name '${nameOfListing}'`);
	}
};


