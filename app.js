//jshint esversion:6
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const _ = require('lodash')
const date = require(__dirname + '/date.js') //exports module in date.js (line 2)

//replace the arrays with mongo and mongoose
// const items = ['Buy Food', 'Cook Food', 'Eat Food'] //create an array so we can add items, otherwise every new Item gets replaced
// const workItems = [] //arrays can be constants, i.e items can be added(pushed) but not re-assigned as a value

app.set('view engine', 'ejs') //need to create a directory called 'views' to look for files

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public')) //to tell express to serve up static files, by creating a 'public' folder as static resource

//creating a database connection
mongoose.connect(
  'mongodb+srv://admin-nikhil:linusk94@nikhilballal.h2ugd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)

//create 'items' schema
const itemsSchema = {
  name: String,
}

//create a mongoose model based on the schema (mongoose model is usually capitalized. ie. const Item)
const Item = mongoose.model('Item', itemsSchema)

//creating mongoose documents
const item1 = new Item({
  name: 'First Item',
})
const item2 = new Item({
  name: 'Second Item',
})
const item3 = new Item({
  name: 'Third Item',
})

const defaultItems = [item1, item2, item3]

//creating a list schema
const listSchema = {
  name: String,
  items: [itemsSchema], //takes an array with itemsSchema based items
}

//create a mongoose model for the list
const List = mongoose.model('List', listSchema)

app.get('/', function (req, res) {
  //code cut and pasted in date.js
  // let date = new Date()
  // let currentDay = date.getDay()
  // //javascript to get the date format - refer stackoverflow for code
  // let options = {
  //   weekday: 'long',
  //   day: 'numeric',
  //   month: 'long',
  // }

  // let day = date.getDate()
  //insert all the documents into a collection at once
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err)
        } else {
          console.log('Sucessfully saved all the items')
        }
      })
      res.redirect('/')
    } else {
      res.render('list', { listTitle: 'Today', newListItems: foundItems })
    }
  })
})

//express route parameters (used to redirect to page using url)
app.get('/:customListName', function (req, res) {
  const customListName = _.capitalize(req.params.customListName)

  //check if multiple 'express route parameters' of the same dont get entered in the DB
  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        //create a new list
        const list = new List({
          name: customListName,
          items: defaultItems, //using the defaultItems array created
        })
        list.save()
        res.redirect('/' + customListName)
      } else {
        //show an existing list
        res.render('list', {
          listTitle: foundList.name,
          newListItems: foundList.items,
        })
      }
    }
  })
})

app.post('/', function (req, res) {
  const itemName = req.body.newItem
  const listName = req.body.list

  //new document
  const additem = new Item({
    name: itemName,
  })

  if (listName === 'Today') {
    additem.save()
    res.redirect('/') //takes us to get("/")
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(additem)
      foundList.save()
      res.redirect('/' + listName)
    })
  }
})

app.post('/delete', function (req, res) {
  const checkedItemId = req.body.delete
  const listName = req.body.listName

  if (listName === 'Today') {
    //delete the document using mongodb
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        console.log('Items successfully deleted')
        res.redirect('/')
      }
    })
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function (err, foundList) {
        if (!err) {
          res.redirect('/' + listName)
        }
      }
    )
  }
})

app.get('/work', function (req, res) {
  res.render('list', { listTitle: 'Work List', newListItems: workItems })
})

app.get('/about', function (req, res) {
  res.render('about')
})

app.post('/work', function (req, res) {
  const item = req.body.newItem
  workItems.push(item)
  res.redirect('/work')
})

let port = process.env.PORT
if (port == null || port == '') {
  port = 3000
}
app.listen(port, function () {
  console.log('Server has started successfully')
})
