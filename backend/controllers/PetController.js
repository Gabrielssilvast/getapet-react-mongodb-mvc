const Pet = require('../models/Pet')

//helpers
const getToken = require('../helpers/getToken')
const getUserByToken = require('../helpers/getUserByToken')

module.exports = class PetController {
  //create Pet
  static async create(req, res) {
    const { name, age, weight, color } = req.body

    const images = req.files

    const available = true

    //img upload

    //validations
    if (!name) {
      res.status(422).json({ message: 'O nome é obrigatório!' })
      return
    }
    if (!age) {
      res.status(422).json({ message: 'A idade é obrigatório!' })
      return
    }
    if (!weight) {
      res.status(422).json({ message: 'O peso é obrigatório!' })
      return
    }
    if (!color) {
      res.status(422).json({ message: 'A cor é obrigatório!' })
      return
    }

    if (images.length === 0) {
      res.status(422).json({ message: 'A imagem é obrigatória!' })
      return
    }

    //get pet owner
    const token = getToken(req)
    const user = await getUserByToken(token)

    //create a pet
    const pet = new Pet({
      name,
      age,
      weight,
      color,
      available,
      images: [],
      user: {
        _id: user._id,
        name: user.name,
        image: user.image,
        phone: user.phone,
      },
    })

    images.map((image) => {
      pet.images.push(image.filename)
    })

    try {
      const newPet = await pet.save()
      res.status(201).json({
        message: 'Pet cadastrado com sucesso!',
        newPet,
      })
    } catch (error) {
      res.status(500).json({ message: error })
    }
  }

  static async getAll(req, res) {
    const pets = await Pet.find().sort('-createdAt')

    res.status(200).json({
      pets: pets,
    })
  }

  static async getAllUserPet(req, res) {
    //Get User from token
    const token = getToken(req)
    const user = await getUserByToken(token)

    const pets = await Pet.find({ 'user._id': user._id }).sort('-createdAt')

    res.status(200).json({
      pets,
    })
  }

  static async getAllUserAdoptions(req, res) {
    const token = getToken(req)
    const user = await getUserByToken(token)

    const pets = await Pet.find({ 'adopter._id': user._id }).sort('-createdAt')

    res.status(200).json({
      pets,
    })
  }
}
