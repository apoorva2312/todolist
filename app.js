//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require('lodash');
//const date = require(__dirname + "/date.js");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Creating Database
mongoose.connect("mongodb+srv://admin-apoorv:2313agatha@cluster0.yzp71ts.mongodb.net/todolist",{useNewUrlParser: true}).then(console.log("DB created!"));
//Creating Schema
const itemSchema = new mongoose.Schema({
  itemName: String
});
const listSchema = new mongoose.Schema({
  listName : String,
  items : [itemSchema]
});
//Creating Collection
const item = mongoose.model("Item", itemSchema);
const list = mongoose.model("List",listSchema);
//Adding default items
const item1 = new item({itemName:"Go for a Walk"});
const item2 = new item({itemName:"Have eggs for breakfast."});
const item3 = new item({itemName:"Make a list of groceries to shop."});
const defaultItems = [item1,item2,item3];

app.get("/", async function(req, res) {
  const list = await item.find({});
  //const day = date.getDate();
  if(list.length===0){
    item.insertMany(defaultItems);
    res.redirect("/");/redirect to same page after initializing/}
  else{
  //console.log(list);
  res.render("list", {listTitle: "Today", newListItems: list});}
});

app.post("/", async function(req, res){
  const rItem = await req.body.newItem;
  const rList = await req.body.list;
  const addedItem = new item ({itemName: rItem});
  if(rList ==="Today"){
  addedItem.save();
  res.redirect("/");}
  else{
    const reqList = await list.findOne({listName:rList});
    console.log(reqList.items);
    reqList.items.push(addedItem);
    reqList.save();
    res.redirect(`/${rList}`);
  }
});

app.post("/delete", async function(req,res){
  const checkedItemID = await req.body.checkbox;
  const listName = await req.body.listName;
  if(listName==="Today"){
    await item.findByIdAndRemove(checkedItemID);
    res.redirect("/");
  }
  else{
    await list.findOneAndUpdate({listName:listName},{$pull:{items:{_id:checkedItemID}}});
    res.redirect(`/${listName}`);
  }
})

app.get("/:listName", async function(req,res){
  const reqListName = _.capitalize(req.params.listName);
  const checkForList = await list.findOne({listName:reqListName});
  if (checkForList===null){
    const newList = new list({
    listName: reqListName,
    items: defaultItems});
    newList.save();
    res.redirect(`/${reqListName}`);}
  else{
  res.render("list", {listTitle: reqListName, newListItems: checkForList.items});}
  
  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
