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

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(p => p.id === id)
    
  if (person){
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.delete('/api/persons/:id', (req,res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)

  res.status(204).end()
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

  // const names = persons.map(person => person.name)
  
  // if (names.indexOf(body.name) !== -1){
  //   return res.status(400).json({
  //     error: 'Name must be unique'
  //   })
  // }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    res.json(savedPerson.toJSON())
  })
})

app.get('/info', (req,res) => {
  res.send(`
    <div>
      Phonebook has info for ${persons.length} people
      <br>
      ${new Date()}
    </div>
  `)
})


const unknownEndpoint = (req,res) => {
  res.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})