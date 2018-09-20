const _ = require('lodash')
const BillingCycle = require('../billingCycle/billingCycle')

//Mais uma função middleware / se não usar os ultimos parametros podemos suprimir
// neste caso o next()
function getSummary(req, res){
  // função aggregate do Mongoose
  BillingCycle.aggregate([
  // pipeline de agregaçãop
  {
    $project: {credit: {$sum: "$credits.value"}, debt: {$sum: "$debts.value"}}
  }, {
    $group: {_id: null, credit: {$sum: "$credit"}, debt: {$sum: "$debt"}}
  }, {
    $project: {_id: 0, credit: 1, debt: 1}
  }],
  function(error, result) {
    if(error){
      res.status(500).json({errors: [error]})
    } else {
      res.json(_.defaults(result[0], {credit: 0, debt: 0}))
    }
  })
/*
  isd.aggregate([
          {
              $project: {
                  month: {$month: "$created"}
              }
          }, {
              $group: {
                  _id: "$month",
                  users: {$sum: 1}
              }
          }
      ], function (err, result) {
          if (err) {
              next(err);
          } else {
              res.json(result);
          }
      });
*/

}

module.exports = { getSummary }
