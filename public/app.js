
//get saved articles
$(document).on('click', '#showsaved', function(){

     $.getJSON("/articles", function(data){
      console.log(data);
      $("#articles").html("");
      for (var i = 0; i < data.length; i++) {
        console.log("noteid: " + data[i].note);
    // Display the information on the page
    $("#articles").append("<div class='well'> <p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + 
      "</p> <button type='button' id='openmodal' class='btn btn-warning' data-toggle='modal' data-target='#myModal' note-id='" + data[i].note + "' data-id='" + data[i]._id +"'>Save Note</button> " + 
      "<button type='button' id='ArticleDelete' class='btn btn-danger'  data-id='" + data[i]._id +"'>Delete Article</button> </div>");
   
  }
  });
});
//get new articles
$(document).on('click', '#scrapenew', function(){

     $.getJSON("/scrape", function(data){
      console.log(data);
      $("#articles").html("");
      for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      
      $("#articles").append("<form action='/savearticle' method='post'><div class='well'> <h3 id='title'>" + data[i].title + "</h3> <br/> <p id='link'>" + data[i].link + 
      "</p> " + 
      "<button type='button' id='savearticle' class='btn btn-primary' data-title='" + data[i].title + "' data-link='" + data[i].link + "'>Save Article</button> </div></form>");
   
      }
  });
});
//delete article

//save the selected article
$(document).on('click', '#savearticle', function(){
  var title = $(this).attr('data-title');
  var link = $(this).attr('data-link');
  
  console.log("title: " + title + ": and link: " + link);
  $.ajax({
    method: "POST",
    url: "/article",
    data: {
      title: title,
      link: link
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      alert("Article: " + data.title + "\n Saved to database.");
      
    });
  

});

//grab the record id when the modal dialogue is opened
$(document).on('click', '#openmodal',function(){
      var recordID = $(this).attr('data-id');
      var noteID = $(this).attr('note-id');
      console.log("note: " + $(this).attr('note-id'));
      $("#rec-id").val(recordID);
      if(noteID === ""){
            
          console.log("no note id");
      }else{
          
             console.log("Note id: " + noteID);


      }

      //if the record already has a note value (query database) then show a delete note option

      //else if no value - then do not show the delete button


      });

//save note to database using the record id and note value that the user entered
$(".NoteSave").click(function(){
     var recordID = $("#rec-id").val();
     var strNote = $("#note-value").val();
     var strTitle = "Note for: " + recordID;
     //console.log("id: " + recordID + ": and note: " + strNote);
     $.ajax({
        method: "POST",
          url: "/articles/" + recordID,
          data: {
          title: strTitle,
          body: strNote
        }
      })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      alert("Note save successful");
      

      
    });

});

$(document).on('click', '#ArticleDelete',function(){
  var recordID = $(this).attr('data-id');
  console.log("id: " + recordID);
  //call route on server .js
  $.ajax({
    method: "GET",
    url: "/delete/" + recordID,
    data: {
      // Value taken from title input
      id: recordID
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      alert("Article Deleted");
      
    });
  

});
// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
