const User = require("../models/User");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

//helpers
const createUserToken = require("../helpers/createUserToken");
const getToken = require("../helpers/getToken");
const getUserByToken = require("../helpers/getUserByToken");

module.exports = class UserController {
  static async register(req, res) {
    const { name, email, password, phone, confirmpassword } = req.body;

    //Validations
    if (!name) {
      res.status(422).json({ messege: "O nome é obrigatório" });
    }

    if (!email) {
      res.status(422).json({ messege: "O E-mail é obrigatório" });
    }

    if (!phone) {
      res.status(422).json({ messege: "O telefone é obrigatório" });
    }

    if (!password) {
      res.status(422).json({ messege: "A senha é obrigatória" });
    }

    if (!confirmpassword) {
      res.status(422).json({ messege: "A confirmação de senha é obrigatória" });
    }

    if (password !== confirmpassword) {
      res.status(422).json({ messege: "As senhas digitadas não são iguais" });
    }

    //check if user exists
    const userExists = await User.findOne({ email: email });

    if (userExists) {
      res.status(422).json({
        messege: "E-mail já cadastrado",
      });
      return;
    }

    //creat a password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    //create a user
    const user = new User({
      name,
      email,
      phone,
      password: passwordHash,
    });

    try {
      const newUser = await user.save();

      await createUserToken(newUser, req, res);
    } catch (error) {
      res.status(500).json({ messege: error });
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;

    if (!email) {
      res.status(422).json({ message: "O E-mail é obrigatório" });
      return;
    }

    if (!password) {
      res.status(422).json({ message: "A senha é obrigatória" });
      return;
    }

    //check if user exists: Login
    const user = await User.findOne({ email: email });

    if (!user) {
      res.status(422).json({
        message: "Não há usuário cadastrado com esse e-mail!",
      });
      return;
    }

    //check access password in db
    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      res.status(422).json({
        message: "Senha inválida!",
      });
    }

    await createUserToken(user, req, res);
  }

  static async checkUser(req, res) {
    let currentUser;

    if (req.headers.authorization) {
      const token = getToken(req);
      const decoded = jwt.verify(token, "meu_secret");

      currentUser = await User.findById(decoded.id);

      currentUser.password = undefined;
    } else {
      currentUser = null;
    }
    res.status(200).send(currentUser);
  }

  static async getUserById(req, res) {
    const id = req.params.id;

    const user = await User.findById(id).select("-password");

    if (!user) {
      res.status(422).json({
        message: "Usuário não encontrado!",
      });
      return;
    }
    res.status(200).json({ user });
  }

  static async editUser(req, res) {
    const id = req.params.id;

    //check if user exists
    const token = getToken(req);
    const user = await getUserByToken(token);

    const { name, email, phone, password, confirmpassword } = req.body;

    //user upload image name
    if (req.file) {
      user.image = req.file.filename;
    }

    //validation 2
    if (!name) {
      res.status(422).json({ message: "O nome é obrigatório" });
    }
    user.name = name;

    if (!email) {
      res.status(422).json({ message: "O E-mail é obrigatório" });
    }

    //check if email has already taken
    const userExists = await User.findOne({ email: email });

    if (user.email !== email && userExists) {
      res.status(422).json({ message: "Por favor, utilize outro e-mail" });
      return;
    }
    user.email = email;

    if (!phone) {
      res.status(422).json({ message: "O telefone é obrigatório" });
    }
    user.phone = phone;

    if (password != confirmpassword) {
      res.status(422).json({ message: "As senhas não são iguais!" });
      return;
    } else if (password === confirmpassword && password != null) {
      //creating password
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      user.password = passwordHash;
    }

    try {
      //return user updated data
      await User.findOneAndUpdate(
        { _id: user._id },
        { $set: user },
        { new: true }
      );
      res.status(200).json({ message: "Usuário atualizado com sucesso!" });
    } catch (err) {
      res.status(500).json({ message: err });
      return;
    }
  }
};
