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


app.get('/api/persons', (req, res) => {
  Person
    .find({})
    .then((persons => {
      res.json(persons.map(person => person.toJSON()))
    }))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
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

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person
    .save()
    .then(savedPerson => {
      res.json(savedPerson.toJSON())
    })
    .catch(error => {
      console.log(error.message)
      res.status(400).json({ error: error.message })
    })

})

app.put('/api/persons/:id', (req,res, next) => {
  const body = req.body
  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
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
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = ( error, req, res, next) => {
  console.log(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return res.status(400).send({ error: 'malformatted id' })
  }  else if (error.name === 'ValidationError') {       return res.status(400).json({ error: error.message })  }

  next(error)
}
// handler of requests with result to errors
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})