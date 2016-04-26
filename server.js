var express = require("express"),
    app = express(),
    http = require("http").Server(app),
    // import the mongoose library
    mongoose = require("mongoose"),
    // import socket.io library
    io = require("socket.io")(http);


app.use(express.static(__dirname + "/client"));
app.use(express.bodyParser());

// connect to the amazeriffic data store in mongo
mongoose.connect("mongodb://localhost/amazeriffic");
// connect to socket.io
io.on("connection", function(socket){
  console.log("a user connected");
  // disconnect from socket.io
  socket.on("disconnect", function(){
    console.log("user disconnected");
  });
  socket.on("addToDo", function(todo){
    console.log("Add To Do with description: " + todo.description + " tag: "+ todo.tags);
    socket.broadcast.emit("add", todo);
    
  });
});
// This is our mongoose model for todos
var ToDoSchema = mongoose.Schema({
    description: String,
    tags: [ String ]
});

var ToDo = mongoose.model("ToDo", ToDoSchema);

http.listen(3000, function (){
    console.log("listening on port: 3000");
});

app.get("/todos.json", function (req, res) {
    ToDo.find({}, function (err, toDos) {
	res.json(toDos);
    });
});

app.post("/todos", function (req, res) {
    console.log(req.body);
    var newToDo = new ToDo({"description":req.body.description, "tags":req.body.tags});
    newToDo.save(function (err, result) {
	if (err !== null) {
	    // the element did not get saved!
	    console.log(err);
	    res.send("ERROR");
	} else {
	    // our client expects *all* of the todo items to be returned, so we'll do
	    // an additional request to maintain compatibility
	    ToDo.find({}, function (err, result) {
		if (err !== null) {
		    // the element did not get saved!
		    res.send("ERROR");
		}
		res.json(result);
	    });
	}
    });
});
