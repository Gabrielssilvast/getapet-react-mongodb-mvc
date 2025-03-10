const jwt = require('jsonwebtoken')

const createUserToken = async (user, req, res) => {
  //create a token
  const token = jwt.sign(
    {
      name: user.name,
      id: user._id,
    },
    'meu_secret'
  )

  //return token
  res.status(200).json({
    messege: 'Você está autenticado!',
    token: token,
    userId: user._id,
  })
}

module.exports = createUserToken
