//jslhint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
//const date = require(__dirname + "/date.js");



const app = express();




//const items = [  "Buy Food" , "Cook Food" , "Eat Food"];
//let workItems = [];

app.set('view engine' , "ejs");

app.use(bodyParser.urlencoded({extende:true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://Admin-Deepali:Test123@cluster0-54xtj.mongodb.net/todolistDB", { useNewUrlParser:true});

const itemsSchema = {
  name:String
};

const Item = mongoose.model("Item" , itemsSchema);

const item1 = new Item ({
  name: "welcome to your todo list."
});
const item2 = new Item ({
  name: "Hit a + button to add an new item."
});
const item3 = new Item ({
  name:"<-- Hit this to delete an item."
});


const defaultItems = [item1, item2 , item3];

const listSchema = {
  name : String,
  items: [itemsSchema]
};

const List = mongoose.model("list", listSchema);

app.get("/" , function(req , res){

//let day = date.getDate();
Item.find({}, function(err, foundItems){

 if(foundItems.length===0){
   Item.insertMany(defaultItems , function(err){
     if(err){
       console.log(err);

     }else{
       console.log("SUCCESS");
     }
   });
   res.redirect("/");
   }
 else{
   res.render('list' , {listTitle: "Today"/*day*/ , newListItems : foundItems });
}

});

});

app.get("/:customlistName", function(req, res){
const customlistName = _.capitalize(req.params.customlistName);

List.findOne({name:customlistName}, function(err, foundList){
  if(!err){
    if(!foundList){
      //create a new list
      const list = new List({
        name: customlistName,
        items: defaultItems
      });
      list.save();

      res.redirect("/" + customlistName);

    }else{
      //show an existing list
      res.render("list", {listTitle: foundList.name/*day*/ , newListItems : foundList.items });
    }
  }

});




});


app.post("/" , function(req , res){
const itemName = req.body.newItem;
const listName = req.body.list;

const item = new Item({
  name: itemName
});

if(listName === "Today"){
  item.save();

  res.redirect("/");
}else{
  List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save("/" + listName);

  });
}
});

app.post("/delete", function(req, res){
const checkedItemId = req.body.checkbox;
const listName = req.body.listName;

if(listName === "Today"){
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(err){
      console.log(err);
    }else{
      console.log("Successfully deleted the item");
      res.redirect("/");
    }
  });
}else{
  List.findOneAndUpdate(
    {name: listName},
    {$pull:{items:{_id:checkedItemId}}},function(err, foundList){
    if(!err){
      res.redirect("/" + listName);
    }
});
}


});
/*if (req.body.list=== "work"){
  workItems.push(item);
  res.redirect("/work");
}
else{
  items.push(item);
  res.redirect("/");
}*/




/*app.get("/work" , function(req , res){
  res.render("list" , {listTitle: "work list" , newListItems: workItems});
});*/

app.get("/about" , function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}
app.listen(3000 , function(){
  console.log("Server has started Successfully");
});
