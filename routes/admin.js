var express = require('express');
const userModel = require('../models/users');
const categoryModel = require('../models/categories');
const authorModel = require('../models/authors');
const bookModel = require('../models/books');
const session = require('express-session')
let flash = require('connect-flash')
var bcrypt = require('bcrypt');

var router = express.Router();

router.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

router.use(flash())
router.use(session({
  genid: function(req) {
    return genuuid() // use UUIDs for session IDs
  },
  secret: 'keyboard cat'
}))
router.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))
router.post('/',async (req,res) => {
  const user = await userModel.findOne({"email":req.body.email}) 
  console.log(req.body.email);
  if(user){
  bcrypt.compare(req.body.password, user.password, function (err, result) {
    if (result == true) {
        session.id = user.id;
        res.statusCode = 302;
        res.setHeader("Location", "/admin/home");
        res.send("logged in");        
        return;
    } else {
      res.render('layouts/adminlogin', {layout: 'adminlogin'});
    }
  });
}
else {
    res.render('layouts/adminlogin', {layout: 'adminlogin'});
 }
});

router.get('/', function(req, res,next) {
    res.render('layouts/adminlogin' ,{layout: 'adminlogin'});
  });

router.get('/home', async (req, res,) => {
    const categories = await categoryModel.find({})
    const books = await bookModel.find({})
    const authors = await authorModel.find({})
    res.render('layouts/adminhome' ,{categories: categories, books: books , authors: authors ,layout: 'adminhome'});
    return;
  });

router.post('/categories', async (req, res) => {
    const category = new categoryModel(req.body);
    try {
     const tmp = await category.save();
      res.redirect("/admin/home");
      return;
    } catch (err) {
      res.send(err);
    }
    
  });

router.get('/categories/:id', async (req, res) => {
    try {
      const category = await categoryModel.findByIdAndDelete(req.params.id)
      if (!category) res.status(404).send("No item found")
      // res.status(200).send("DELETED")
      // res.setHeader("Location", "/admin/home");
      res.redirect("/admin/home");
      return;
    } catch (err) {
      res.status(500).send(err)
    }
  });

router.post('/categories/:id', async (req, res) => {
    try {
        console.log("here");
        
        const temp = await categoryModel.findByIdAndUpdate(req.params.id, req.body)
        temp.save()
        res.redirect("/admin/home");
        return;
    } catch (err) {
      res.status(500).send(err)
    }
  });

router.post('/authors', async (req, res) => {
    const author = new authorModel(req.body);
    try {
     const tmp = await author.save();
     res.redirect("/admin/home");
     return;      
    } catch (err) {
      res.send(err);
    }
    
  });

router.get('/authors/:id', async (req, res) => {
    try {
      const author = await authorModel.findByIdAndDelete(req.params.id)
      if (!author) res.status(404).send("No item found")
      // res.status(200).send()
      res.redirect("/admin/home");
      return;
    } catch (err) {
      res.status(500).send(err)
    }
  });

router.post('/authors/:id', async (req, res) => {
    try {
      
      const tmp = await authorModel.findByIdAndUpdate(req.params.id, req.body)
      tmp.save()
      res.redirect("/admin/home");
      return;
      // res.send(author)
    } catch (err) {
      res.status(500).send(err)
    }
  });


router.post('/books', async (req, res) => {
    console.log(req.body);
    // const user  = await authorModel.find(req.params.user)
    // const category = await categoryModel.find(req.params.category)
    // console.log(req.params.user.id);
    const book = new bookModel(req.body);
    try {
     const tmp = await book.save();
     res.redirect("/admin/home");
     return; 
    } catch (err) {
      res.send(err);
    }
    
  });

module.exports = router;
  
