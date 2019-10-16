const mongoose = require('mongoose')

if (process.argv.length < 5 && process.argv.length > 3) {
  console.log('program needs 3 arguments: password personName personNumber');
  process.exit(1)
} 

const password = process.argv[2]
const personName = process.argv[3]
const personNumber = process.argv[4]

const url = `mongodb+srv://aga:${password}@cluster0-ekiel.mongodb.net/phonebook-app?retryWrites=true`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Person = mongoose.model('Person', personSchema)

if (personName && personNumber ){
  const person = new Person({
    name: personName,
    number: personNumber
  })
  
  person.save()
    .then(response =>{
      console.log(`Added ${personName} number ${personNumber} to phonebook`);
      mongoose.connection.close()
    })
} else {
  console.log('phonebook:');
  Person
    .find({})
    .then(people => {
      people.forEach(person => {
        console.log(person.name, person.number);
      })
      mongoose.connection.close()
    })
}
