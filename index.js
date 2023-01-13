const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
// const { createAndSaveUser } = require('./schemas.js')
const User = require("./schemas.js").User;
const Exercise = require("./schemas.js").Exercise;
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true, useUnifiedTopology: true
});
const TIMEOUT = 10000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static('public'));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const createUser = require("./schemas.js").createAndSaveUser;
app.post("/api/users", function(req, res, next) {
  createUser(req.body.username, function(err, data) {
    if (err) {
      return next(err);
    }
    User.findById(data._id, "username _id", function(err, usuario) {
      if (err) {
        return next(err);
      }
      res.send({ username: usuario.username, _id: usuario._id })
    })
  })
})


app.post("/api/users/:_id/exercises", function(req, res, next){
  if(req.params._id && req.body){
    var id = req.params._id
    User.findById(id,'username',function(err, usuario){
      if (err){
        return next(err);
      }
      if(!usuario){
        console.log('no hay usuario')
        req.body = null
        next();
      }else{
        var date = req.body.date ? new Date(req.body.date) : new Date();
        body = {
          id: id,
          username: usuario.username,
          description: req.body.description,
          duration: Number(req.body.duration),
          date: date  
        }
        var exercise = new Exercise(body)
        exercise.save(function(err,data){
          if (err) return console.log(err)
          if(data){
            Exercise.findById(data._id,function(err,exer){
              if (err) return console.log(err)
              req.body = {
                _id: exer.id,
                username: usuario.username,
                description: exer.description,
                duration: exer.duration,
                date: exer.date.toDateString()
                
              }
              next();
            })
          }
        })
      }
        
      
    })
  }else{
    req.params
    req.body=null
    next();
  }
},function(req, res){
  res.json(req.body)
})


app.get('/api/users', function(req, res) {
  User.find({}, 'username', function(err, users) {
    if (err) throw err;
    res.json(users)
  })
})

app.get("/api/users/:_id?/logs", function(req, res) {
  let id = req.params._id;
  let from = req.query.from || new Date(0) ;
  let to = req.query.to || new Date(Date.now());
  let limit = Number(req.query.limit) || 0;
  console.log(id)
  User.findById(id, function(err, usuario) {
    if (err) throw err;
    if (!usuario) {
      return console.log(err)
    }
    let name = usuario.username
    Exercise.find({ id: id }, 'description duration date _id').where('date').gte(from).lte(to).limit(limit).exec(function(err, data) {
      if (err) return console.log(err);
      arr = data.map(element => ({
        description: element.description,
        duration: Number(element.duration),
        date: element.date.toDateString()
      }))
      body = {
        username: name,
        count: arr.length,
        _id: id,
        log: arr
      }
      console.log(body,' logs')
      res.json(body)
    })
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
