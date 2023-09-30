require('dotenv').config();
const express = require ("express");
const bodyParser = require ("body-parser");
const mongoose = require ('mongoose');
const _ = require("lodash");

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://niteshkumaryadav813:Nitesh7521@cluster0.umtryfz.mongodb.net/todolistDB");

const itemschema = {
  name: String,
};

const Item = mongoose.model("Item", itemschema)

const item1 = new Item ({
  name: "welcome to your todolist!"
});
const item2 = new Item ({
  name: "Hit the + button to aff a new item."
});
const item3 = new Item ({
  name: "<-- Hit this ti delete an item"
});

const defaultItem = [item1, item2, item3];

const listSchema ={
  name: String,
  items: [itemschema],
};

const List = mongoose.model("List", listSchema);






app.get("/", function (req, res) {

    
  Item.find({})
    .then(foundItems => {
      if(foundItems.length === 0){
        Item.insertMany(defaultItem)
        .then(function () {console.log("Successfully saved defult items to DB"); })
        .catch(function (err) { console.log(err);});
        res.redirect("/");
      }else{
        res.render("index.ejs", { listTitle: "Today", newListItems: foundItems });
      }
    })
    .catch(err => {
      console.log(err);
      res.send("Error retrieving items.");
    });
});




app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({ name: itemName });
    
    if(listName === "Today"){
      item.save();
      res.redirect("/");
    }else{
      List.findOne({name: listName})
      .then(foundList => {
        foundList.items.push(item);
         return foundList.save()
        .then(() => {
          res.redirect("/" + listName);
        });
      })
      .catch(err => {
         console.log(err);
      });

    }
  
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId)
    .then(() => {
      console.log("item deleted");
      res.redirect("/"); 
    })
    .catch(err => {
      console.log(err);
      res.send("Error deleting item.");
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items:{_id:checkedItemId}}})
    .then(foundList => {
      res.redirect("/" + listName);
    })
    .catch(err => {
      console.log(err);
      res.send("Error updating list.");
    });
  }
});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
    .then(foundList => {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItem,
        });
        return list.save();
      } else {
        return foundList;
      }
    })
    .then(list => {
      res.render("index.ejs", { listTitle: list.name, newListItems: list.items });
    })
    .catch(err => {
      console.log(err);
      res.send("Error processing custom list name.");
    });
});



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});




