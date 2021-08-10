const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Mongoose connection open");
});

const itemsSchema = new mongoose.Schema({
  name: String,
  date: String,
});
const Item = mongoose.model("Item", itemsSchema);


var today = new Date();
var options = {
  weekday: "long",
  day: "numeric",
  month: "long",
};
var day = today.toLocaleDateString("en-US", options);


const item1 = new Item({
  name: "Welcome to your To Do list",
  date: day,
});

const defaultItems = [item1];




app.get("/", (req, res) => {
  Item.find({date: day},function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) console.log(err);
        else {
          console.log("Successfully saved default items to db");
        }
      });
      // item1.save(function (err) {
      //   if (err) return console.error(err);
      // });
      res.redirect("/");
    }else{
      res.render("list", { listTitle: day, newListItems: foundItems });
    }
    
  });
});

app.post("/", (req, res) => {
    const itemName = req.body.newItem;
    const item = new Item({ name: itemName, date: day });
    item.save(function (err) {
      if (err) return console.error(err);
    });

    res.redirect("/");
});

app.post("/delete", (req,res)=>{
  const checkedItemId = req.body.checkbox;
  Item.deleteOne({_id: checkedItemId}, function(err){
    if(err)
      console.log(err);
    else{
      console.log("Successfully deleted")
    }  
  });
  res.redirect("/");
})
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started at port 3000`);
});
