//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose= require("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-lakshya:Admin123@cluster0.ig36q.mongodb.net/todolistDB", {useNewUrlParser:true});

const itemSchema={
  name: String
}

const Item= mongoose.model("Item", itemSchema);

const listSchema={
  name: String,
  items: [itemSchema]
};

const List=mongoose.model("list", listSchema);


const item1=new Item({name:"Welcome to your TO-DO List"});
const item2=new Item({name:"Hit + button to add a new Item."});
const item3=new Item({name:"<-- Hit this to delete an Item"});

const defaultItems=[item1, item2, item3];

// Item.insertMany(defaultItems, function(err){
//   if(err) console.log(err);
//   else console.log(" Successfully Inserted !!! ");
// });


// const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.get("/", function(req, res) {
  
  Item.find({}, function(err,results){
    if(results.length==0){
        Item.insertMany(defaultItems, function(err){
          if(err) console.log(err);
          else console.log(" Successfully Inserted !!! ");
          res.redirect("/");
        });
    }else res.render("list", {listTitle: "Today", newListItems: results});
  })
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.listItem;
  const item=new Item({name: itemName});
 
  if(listName=="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    
    List.findOne({name: listName}, function(err, foundlist){
          foundlist.items.push(item);
          foundlist.save();
          res.redirect("/"+listName);
    })

    // List.findOne({name: listName}, function(err, foundList){
    //  if(!foundList){
    //   item.save();
    //   res.redirect("/");
    //  }else{
    //   foundList.items.push(item);
    //   foundList.save();
    //   res.redirect("/"+listName);
    //  }
    // })
  }
});

app.post("/delete", function(req, res){
  var itemid=req.body.checkbox;
  var listName=req.body.listName;

  if(listName=="Today"){
    Item.findByIdAndRemove(itemid, function(err){
      if(!err) {
        // console.log("deleted");
        res.redirect("/");
      }
      else console.log(err);
    })
  }
  else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemid}}}, function(err, foundlist){
        if(!err){
          res.redirect("/"+listName);
        }
    })
  }


});

app.get("/:customListName", function(req,res){
  var customListName=req.params.customListName;
  List.findOne({name: customListName}, function(err, foundlist){
    if(!err){
      if(!foundlist){
        const list= new List({
          name: customListName, 
          items: defaultItems
        });
      
        list.save();
        res.redirect("/"+customListName);
      }else {
        res.render("list", {listTitle: foundlist.name, newListItems: foundlist.items}); 
      }
    }
  })
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully !!!");
});
