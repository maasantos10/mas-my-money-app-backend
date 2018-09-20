const _ = require('lodash')
const BillingCycle = require('./billingCycle')

// Cria os métodos da API através do "node-restful" automaticamente.
// crud methods
BillingCycle.methods(['get', 'post', 'put', 'delete'])

BillingCycle.after('post', sendErrorsOrNext).after('put', sendErrorsOrNext)

function sendErrorsOrNext(req, res, next){
  const bundle = res.locals.bundle

  if(bundle.errors){
    var errors = parseErrors(bundle.errors)
    res.status(500).json({errors})
  } else {
    next()
  }
}

function parseErrors(nodeRestfulErrors) {
  const errors = []
  _.forIn(nodeRestfulErrors, error => errors.push(error.message))
  return errors
}

//Ao atualizar um registro ele irá retonar o registro atualizado na próxima consulta
BillingCycle.updateOptions({new: true, runValidators: true})

//Criar uma nova rota para count
BillingCycle.route('count', function(req, res, next){
  BillingCycle.count(function(error, value){
    if(error){
      res.status(500).json({errors: [error]})
    } else {
       res.json({value})
    }
  })
})

module.exports = BillingCycle
