var express = require("express");
var bodyParser = require("body-parser");
var session = require('express-session');
var path = require('path');
const mongoose = require('mongoose');
var cors = require('cors')

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
	app.use(cors());
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
			const results = await client.db("dbCENTIXO").collection("details").findOne({ name: username });
			//console.log(results.password);
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

	app.get('/Retrieve',async function (request, response) {
		try {
			
			const results = await client.db("dbCENTIXO").collection("details").find().toArray();
			response.send(results)
		}
		catch (e) {
			console.error(e);
		}
	});

	app.post('/RetrieveOne', async function (request, response) {
		try {
			const gettask = {
				id: request.body.id
			}
			const results = await client.db("dbCENTIXO").collection("details").findOne(gettask);
			response.send(results)
		}
		catch (e) {
			console.error(e);
		}
	});

	app.post('/Add',async function (request, response) {
		try {
			const idr = Math.random();
			const newTask = {
				text:request.body.text,
				day:request.body.day,
				reminder: request.body.reminder,
				id:idr
			}
			const insertres = await client.db("dbCENTIXO").collection("details").insertOne(newTask);
			if (insertres.insertedCount > 0)
			{
				const results=await client.db("dbCENTIXO").collection("details").findOne({id:idr});
				response.send(results)
			}
		}
		catch (e) {
			console.error(e);
		}
	});
	app.post('/Delete', async function (request, response) {
		try {
			//console.log(request.body.id);
			const deltask = {
				id: request.body.id
			}
			const results = await client.db("dbCENTIXO").collection("details").deleteOne(deltask);
			response.send(results)
		}
		catch (e) {
			console.error(e);
		}
	});

	app.post('/Update', async function (request, response) {
		try {
			// create a filter for a movie to update
			const filter = { text: request.body.text};
			// this option instructs the method to create a document if no documents match the filter
			const options = { upsert: true };
			// create a document that sets the plot of the movie
			const updateDoc = {
			  $set: {
				reminder:
				  request.body.reminder,
			  },
			};
			const updres=await client.db("dbCENTIXO").collection("details").updateOne(filter, updateDoc, options);
			if(updres.matchedCount>0){
				const gettask = {
				id: request.body.id
			}
			const results = await client.db("dbCENTIXO").collection("details").findOne(gettask);
				response.send(results)
			}
		}
		catch (e) {
			console.error(e);
		}
	});

	app.listen(3005);
	console.log('server running at locahost 3005');

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


