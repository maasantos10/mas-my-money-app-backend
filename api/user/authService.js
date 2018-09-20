const _ = require('lodash')
const jwt = require('jsonwebtoken') // token
const bcrypt = require('bcrypt') // criptografar a senha
const User = require('./user')
const env = require('../../.env')

// validar formato do email
const emailRegex = /\S+@\S+\.\S+/ // String, com @, com String, com ponto com uma string
//validar senha com
// essa senha precisa ter letras minísculas [a-z]
// letras maísculas [A-Z]
// caracter especial [@#$%]
// precisa ter um tamanho entre 6 e 12 {6,12}
const passwordRegex = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]).{6,12})/

const sendErrorsFromDB = (res, dbErrors) => {
  const errors = []
  _.forIn(dbErrors.errors, error => errors.push(error.message))
    return res.status(400).json({errors})
}

const login = (req, res, next) => {
  const email = req.body.email || ''
  const password = req.body.password || ''

  //precisa colocar "https" na aplicação caso contrário as informações
  // por exemplo de e-mail e senha ficam expostas do browser até o
  // servidor. aplicativos como wireshark para fazer sniffer na rede
  // podem capturar as informações.
  // qualquer monitor de rede pode capturar a senha.
  // não basta apenas colocar autenticação precisa colocar segurança.
  User.findOne({email}, (err, user) => {
    if(err) {
      return sendErrorsFromDB(res, err)
    } else if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign(user, env.authSecret, {
        //expiresIn: "1 day"
        expiresIn: "4 hours"
      })
      const { name, email } = user
      res.json({ name, email, token })
    } else {
      return res.status(400).send({errors: ['Usuário/Senha inválidos']})
    }
  })
}

// middleware para validar o jsonwebtoken
// vamos armazenar no local storage do browser.
// vamos armazenar por um dia o token, por exemplo validar quando fechar e abrir
// o browser e assim por diante.
const validateToken = (req, res, next) => {
  const token = req.body.token || '' // token e se não vier nada passa vazio
  jwt.verify(token, env.authSecret, function(err, decoded) {
    return res.status(200).send({valid: !err})
  })
}

// método para signup
const signup = (req, res, next) => {

  const name = req.body.name || ''
  const email = req.body.email || ''
  const password = req.body.password || ''
  const confirmPassword = req.body.confirm_password || ''

  //validação do formato do email
  if(!email.match(emailRegex)) {
    return res.status(400).send({errors: ['O e-mail informado está inválido']})
  }

  //validação da senha
  if(!password.match(passwordRegex)) {
    return res.status(400).send({errors: [
      "Senha precisar ter: uma letra maiúscula, uma letra minúscula, um número, uma caractere especial(@#$%) e tamanho entre 6-12."
    ]})
  }

  // salt ou sabor
  const salt = bcrypt.genSaltSync() // randomico, mesmo passando a mesma senha em times diferentes ele irá gerar um outro valor.
  // o bcrypt usa o sabor acim para gerar o hash da senha, conforme abaixo:
  const passwordHash = bcrypt.hashSync(password, salt)
  if(!bcrypt.compareSync(confirmPassword, passwordHash)) {
    return res.status(400).send({errors: ['Senhas não conferem.']})
  }

  User.findOne({email}, (err, user) => {
    if(err) {
      return sendErrorsFromDB(res, err)
    } else if (user) {
      return res.status(400).send({errors: ['Usuário já cadastrado.']})
    } else {
      const newUser = new User({ name, email, password: passwordHash })
      newUser.save(err => {
        if(err) {
          return sendErrorsFromDB(res, err)
        } else {
          login(req, res, next)
        }
      })
    }
  })
}

module.exports = { login, signup, validateToken }
