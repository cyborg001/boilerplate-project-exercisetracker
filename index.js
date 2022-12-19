const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
mongoose.set('strictQuery', true)
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true, useUnifiedTopology: true
});


app.use(bodyParser.urlencoded({extended: false}))
app.use(cors())
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// crea un esquema y un model para User
const userSchema = new mongoose.Schema({
  username: String,
});
const User = mongoose.model('User', userSchema);

// crea un esquema y un model para Exercises
const exerciseSchema = new mongoose.Schema({
  id: String,
  username: String,
  description: String,
  duration: Number,
  fecha: Date
});
const Exercise = mongoose.model('Exercise', exerciseSchema);


app.post('/api/users',function(req, res){
  username = req.body.username;
  let user = new User({
    username: username
  })
  user.save(function(err, usuario){
    if (err) return console.log(err);
    console.log('user created.');
    res.send({username: username, "_id": usuario._id});
  })
  
});
let username;
app.post('/api/users/:_id/exercises',function(req, res){
  let fecha =  new Date(req.body.date)
  console.log(fecha)
  let id = req.body.id = req.body[':_id'];
  User.findById(id, function(err, usuario){
    if (err) return console.log(err);
    username = usuario.username
    req.body.username = usuario.username
    body = {
      id: id,
      username: username,
      description: req.body.description,
      duration: Number(req.body.duration),
      fecha: fecha
    }
    var exercise = new Exercise(body);
    exercise.save(function(err,ejercicio){
      if (err) return console.log(err);
      console.log('Ejercicio creado');
      output = {
        "_id": ejercicio.id,
        "username": ejercicio.username,
        "date": ejercicio.fecha.toDateString(),
        "duration": ejercicio.duration,
        "description": ejercicio.description
      }
      res.send(output);
      
    });
  }); 
})

  app.get("/api/users/:_id/logs",function(req, res){
    let id = req.params._id;
    let from = new Date("1 January 1970");
    let to = new Date();
    let limit = ''; 
    if (req.query.from){
      from = new Date(req.query.from);
    }
    if (req.query.to){
      to = new Date(req.query.to);
    }
    if (req.query.limit){
      limit = Number(req.query.limit);
    }
    console.log(to.toDateString())
    console.log(id)
    query = Exercise.find({id:id},'description duration fecha -_id').where('fecha').gte(from).lte(to).limit(limit).exec(function(err,data){
      if (err) return console.log(err);
      arr = data.map(element => ({"description" :element.description,
                                "duration": element.duration,
                                "date": element.fecha.toDateString()
                                }))
      res.send({"_id": id,
                "username": req.body.username,
                "count": arr.length,
                "log": arr
              })
    })
  })





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})


  exports.User = User;