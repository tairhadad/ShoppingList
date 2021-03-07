//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");
//const date = require(__dirname +  "/date.js");



const items = []

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-hadad:Taihad0416@cluster0.toyds.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({ name: "Welcome to your todolist!" });
const item2 = new Item({ name: "Hit the + button to aff a new item." });
const item3 = new Item({ name: "<-- Hit this to delete an item." });

const defaultItems = [item1,item2, item3];
const listSchema = {
  name: String,
  items: [itemSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/", function(req,res){
  Item.find({},function(err,foundItems){
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if(err){ console.log(err);}
        else{ console.log("Successfully savevd defult items to DB."); }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", addTaskToList: foundItems});
    }
  });
});

app.post("/", function(req,res){

  const itemName = req.body.addTask;
  const listName = req.body.list;
  const item = new Item({ name: itemName });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    })
  }

});

app.post("/delete", function(req,res){

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err) { console.log(err); }
      else{
        console.log("Succesfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name:listName},{$pull:{items: {_id: checkedItemId}}},function(err,foundList){
      if(err){ console.log(err); }
      else{
        res.redirect("/" + listName);
      }
    });
  }

});


app.get("/:customListName", function(req,res){
  const customListName =  _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" +customListName);
      }
      else{
        res.render("list", {listTitle: foundList.name, addTaskToList: foundList.items});
      }
    }
  })
});


/*app.post("/work", function(req,res){
  const item = req.body.newItem;
  workItems.push(item);

  res.redirect("/work");
});*/


app.listen( 3000, function(){
  console.log("Server is running on port 3000")
});
