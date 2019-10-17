require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')


morgan.token('body', function (req, res) {
  return JSON.stringify(req.body)
})

const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.static('build'))

let persons = [
  
    {
      "name": "Arto Hellas",
      "number": "040-123456",
      "id": 1
    },
    {
      "name": "Ada Lovelace",
      "number": "39-44-5323523",
      "id": 2
    },
    {
      "name": "Dan Abramov",
      "number": "12-43-234345",
      "id": 3
    },
    {
      "name": "Mary Poppendieck",
      "number": "39-23-6423122",
      "id": 4
    }  
]

app.get('/api/persons', (req, res) => {
  Person
    .find({})
    .then((persons => {
      res.json(persons.map(person => person.toJSON()))
    }));  
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      console.log(person);
      if (person){
        res.json(person.toJSON())
      } else {
        res.status(204).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req,res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))    
})

app.post('/api/persons', (req, res) => {
  const body = req.body

  if (body.name === undefined){
    return res.status(400).json({
      error: 'Name missing'
    })
  }

  if (body.number === undefined){
    return res.status(400).json({
      error: 'Number missing'
    })
  }

  const name = body.name
  const number = body.number  

  // check if person with the name already in db
  Person.findOne({name: name})
    .then(person => {
      console.log(person);
      if (person) {
        res.status(400).send({"error": "Name already in database"})
      } else {
        const person = new Person({
          name: name,
          number: number
        })
        person.save().then(savedPerson => {
          res.json(savedPerson.toJSON())
        })
      }
    })  
})

app.put('/api/persons/:id', (req,res, next) => {
  const body = req.body
  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(req.params.id, person, {new: true})
    .then(updatedPerson => {
      res.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))    
})

app.get('/info', (req,res, next) => {
  Person.find({})
    .then(result => {
      res.send(`
    <div>
      Phonebook has info for ${result.length} people
      <br>
      ${new Date()}
    </div>
  `)
    })

  
})


const unknownEndpoint = (req,res) => {
  res.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const errorHandler = ( error, req, res, next) => {
  console.log(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}
// handler of requests with result to errors
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})