// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


// Initialize Express
var app = express();

// Use morgan and body parser
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
//mongoose.connect("mongodb://localhost/newsscrape");
mongoose.connect("mongodb://heroku_bmqkbv3k:la3qtma3eo2ejt4lt14ef6fk4s@ds155674.mlab.com:55674/heroku_bmqkbv3k");

var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});


// Routes
// ======

// A GET request to scrape the echojs website
app.get("/scrape1", function(req, res) {
  // First, we grab the body of the html with request
  request("http://www.echojs.com/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });

    });
  });
  // Tell the browser that we finished scraping the text
  res.send("Scrape Complete");
});


app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  
  request("http://www.echojs.com/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    var results = [];
    $("article h2").each(function(i, element) {

      // Save an empty result object
      

      var link = $(element).children("a").attr("href");
      var title = $(element).children("a").text();

    // Save these results in an object that we'll push into the results array we defined earlier
      results.push({
        title: title,
        link: link
      });
    });
    res.send(results);
  });
  // Tell the browser that we finished scraping the text
  
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
  Article.find({}, function(error, doc) {
    // Send any errors to the browser
    if (error) {
      res.send(error);
    }
    // Or send the doc to the browser
    else {
      res.send(doc);
    }
  });


});

// This will grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {

  Article.findOne({"_id": req.params.id})
    .populate("note")
    .exec(function(error, doc) {
      // Send any errors to the browser
      if (error) {
        res.send(error);
      }
      // Or, send our results to the browser, which will now include the books stored in the library
      else {
        res.send(doc);
      }
    });
  // and run the populate method with "note",

  // then responds with the article with the note included


});
//save new article to database
app.post("/article", function(req, res) {
var newArticle = new Article(req.body);
newArticle.save(function(error, doc){
      if (error) {
      res.send(error);
    }
    // Otherwise
    else {
      res.send(doc);
    }

  });

});
// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
  var newNote = new Note(req.body);
  // Save the new note to mongoose
  newNote.save(function(error, doc) {
    // Send any errors to the browser
    if (error) {
      res.send(error);
    }
    // Otherwise
    else {
      // Find our user and push the new note id into the User's notes array
      console.log(req.params.id);
        Article.findOneAndUpdate({"_id": req.params.id}, { "note": doc._id })
        // Send any errors to the browser
        .exec(function(err, doc){
         if (err) {
          res.send(err);
        }
        // Or send the newdoc to the browser
        else {
          res.send(doc);
        } 
      });
    }
  });
});
//delete an article
// Delete One from the DB
app.get("/delete/:id", function(req, res) {
  // Remove a note using the objectID
  var newArticle = new Article(req.body);
  console.log("article id: " + req.params.id);
  Article.remove({
    "_id": req.params.id
  }, function(error, removed) {
    // Log any errors from mongojs
    if (error) {
      console.log(error);
      res.send(error);
    }
    // Otherwise, send the mongojs response to the browser
    // This will fire off the success function of the ajax request
    else {
      console.log(removed);
      res.send(removed);
    }
  });
});



// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
