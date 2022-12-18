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
  req.body.fecha = req.body.date
  req.body.id = req.body[':_id'];
  User.findById(req.body.id, function(err, usuario){
    if (err) return console.log(err);
    username = usuario.username
    req.body.username = usuario.username
    var exercise = new Exercise(req.body);
    exercise.save(function(err,ejercicio){
      if (err) return console.log(err);
      console.log('Ejercicio creado');
    });
  });
  
})




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})


exports.User = User;