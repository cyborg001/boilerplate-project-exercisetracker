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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// crea un esquema y un model para User
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

// crea un esquema y un model para Exercises
const exerciseSchema = new mongoose.Schema({
  user: { type: mongoose.Mixed },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  fecha: Date
});
const Exercise = mongoose.model('Exercise', exerciseSchema);

app.post('/api/users', function(req, res) {
  username = req.body.username;
  let user = new User({
    username: username
  })
  user.save(function(err, usuario) {
    if (err) {
      return console.log(err);

    } else {
      console.log('user created.');
      res.send({ username: username, "_id": usuario._id });
    }
  })

});

app.get('/api/users', function(req, res) {
  User.find({}, 'username _id', function(err, data) {
    if (err) return console.log(err);
    res.send(data)
  })
})

app.post('/api/users/:_id/exercises', function(req, res) {
  console.log(req.body[':_id'],'hola')
  let id = req.body[':_id']
  let fecha;
  if (req.body.date) {
    fecha = new Date(req.body.date);
  } else {
    fecha = new Date();
  }
  User.findById(id, function(err, user) {
    if (err) return console.log(err);
    console.log(user)
    console.log(fecha)
    let body = {
      user: user,
      description: req.body.description,
      duration: Number(req.body.duration),
      fecha: fecha
    }
    let exercise = new Exercise(body)
    exercise.save(function(err, exer) {
      if (err) {
        return console.log(err);
      } else {
        console.log(exer)
        res.send({
          "username": exer.user.username,
          "description": exer.description,
          "duration": Number(exer.duration),
          "date": exer.fecha.toDateString(),
          "_id": exer.user._id
        })
      }

    })

  })
})
// app.post('/api/users/:_id/exercises', function(req, res) {
//   let fecha;
//   if (req.body.date) {
//     fecha = new Date(req.body.date);
//   } else {
//     fecha = new Date();
//   }
//   console.log(fecha)
//   let id = req.body.id = req.body[':_id'];
//   User.findById(id, function(err, usuario) {
//     if (err) return console.log(err);
//     console.log(usuario,'-------')
//     username = usuario.username

//     body = {
//       id: id,
//       username: username,
//       description: req.body.description,
//       duration: Number(req.body.duration),
//       fecha: fecha
//     }
//     var exercise = new Exercise(body);
//     exercise.save(function(err, ejercicio) {
//       if (err) return console.log(err);
//       console.log('Ejercicio creado', ejercicio);
//       output = {
//         username: ejercicio.username,
//         "description": ejercicio.description,
//         "duration": ejercicio.duration,
//         "date": ejercicio.fecha.toDateString(),
//         "_id": ejercicio.id
//       }
//       res.send(output);

//     });
//   });
// })

// app.get("/api/users/:_id?/logs", function(req, res) {
//   let id = req.params._id;
//   let from = new Date("1 January 1970");
//   let to = new Date();
//   let limit = '';
//   if (req.query.from) {
//     from = new Date(req.query.from);
//   }
//   if (req.query.to) {
//     to = new Date(req.query.to);
//   }
//   if (req.query.limit) {
//     limit = Number(req.query.limit);
//   }
//   console.log(to.toDateString())
//   console.log(id)
//   User.findById(id, function(err, usuario) {
//     if (err) return console.log(err);
//     let name = usuario.username
//     query = Exercise.find({ id: id }, 'description duration fecha username-_id').where('fecha').gte(from).lte(to).limit(limit).exec(function(err, data) {
//       if (err) return console.log(err);
//       console.log(data)
//       arr = data.map(element => ({
//         "description": element.description,
//         "duration": element.duration,
//         "date": element.fecha.toDateString()
//       }))
//       res.send({
//         "username": name,
//         "count": arr.length,
//         "_id": id,
//         "log": arr
//       })
//     })
//   })
// })




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})



exports.User = User;