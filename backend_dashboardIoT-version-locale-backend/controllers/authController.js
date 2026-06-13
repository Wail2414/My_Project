require("dotenv").config();
//il gère l'authentification des users
const bcrypt = require("bcryptjs"); //on import "bcryptjs" qui vérifie le mot de passe (chiffré)
const jwt = require("jsonwebtoken"); // on import "jsonwebtoken" pour créer un token JWT (qui sert à prouver qu'un user est authentifié)
const { User } = require("../models/db"); // on import le db.js pour utiliser le modèle user.js
const userActivityController = require("./userActivityController"); // on import le userActivityController qui logue les activités de user

const secretKey = "your_secret_key"; // clé secrète utilisé pour signer un Token JWT
//process.env.JWT_SECRET;
//on va export la fonction async login
exports.login = async (req, res) => {
  const { email, password } = req.body; //ici on récupère les données envoyés par le client (grâce avec req.body (client --> serveur))

  try {
    const user = await User.findOne({ where: { email } }); // on recherche le user dans la db (via sequelize)
    //si user existe alors
    if (user) {
      const match = await bcrypt.compare(password, user.password); // comparaison des mdp avec bcrypt
      //si le mdp est correcte alors le token contiendra lezs infos de user (id et email), signé avec la clé secrète et expire après 1h
      if (match) {
        const token = jwt.sign(
          { userId: user.id, userEmail: user.email },
          secretKey,
          { expiresIn: "1h" },
        );
        // enregistrement de token dans un cookie sécurisé res.cookie(name,value,options) donc le name c'est le nom de Cookie et value c'est le token JWT et options c'est les reglages
        res.cookie("accessToken", token, {
          httpOnly: true, //cookie ne peut pas être accédé en javascript côté client
          secure: false, // ici on autorise le navigateur a envoyé le cookie même si la requête passe par HTTP
          sameSite: "lax",
          //sameSite: "strict", // le cookie n'est envoyé que si le front et le back sont sur le même domaine //y a aussi none si pas même domaine
          maxAge: 1000 * 60 * 60 * 12, // duréée de vie de cookie en millisecondes
        }); // Attention remettre en true et strict
        // journalisation de l'activité login
        await userActivityController.logActivity(
          user.id,
          user.email,
          "login",
          `User logged in`,
        ); //ici ca log l'activité "login" dans la db donc on recupere le ID et mail du client pour dire que ce client a login
        //res.send({ message: "Logged in successfully" }); // envoie d'une reponse de succès au client (res.send (serveur-->client))
        const { password, ...userInfo } = user.toJSON();
        console.log(userInfo);
        res.send(userInfo); // Envoie l'objet user sans le mot de passe
      } else {
        res.status(401).send({ message: "Invalid credentials" }); // ici c'est lorsque le mdp est pas correct alors ca envoie un message d'erreur
      }
    } else {
      res.status(404).send({ message: "User Not Found" }); // ici c'est lorsque le user n'existe pas alors ca envoie un message d'erreur
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send({ message: "Internal server error" }); // ici si ca marche pas la db genre la methode alors ca envoie erreur de serveur
  }
};

// ici c'est une fct async pour logout où ca va etre export
exports.logout = async (req, res) => {
  try {
    res.clearCookie("accessToken"); //suppresion de cookie qui contient le token
    res.send({ message: "Logged out successfully" }); // du coup ca envoie un message au client pour dire ok logout reussi
    await userActivityController.logActivity(
      req.user.userId, //ici req.user vient de middleware (qui vaut req.user = user) donc c'est comme on faisait user.userId
      req.user.userEmail,
      "logout",
      `User logged out`,
    ); //ici ca log l'activité "logout" dans la db donc on recupere le ID et mail du client pour dire que ce client a logout
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).send({ message: "Internal server error" }); // si erreur alors ca envoie messager d'erreur (du genre le clearCookie marche pas)
  }
};
//récupération des infos de user connecté donc on va faire une fct async "getUserInfo"
exports.getUserInfo = async (req, res) => {
  console.log(">>> /auth/me cookies:", req.cookies);
  try {
    const user = await User.findByPk(req.user.userId); // ca va chercher user dans la db avec son ID
    if (!user) {
      return res.status(404).send({ message: "User not found" }); // si pas trouvé alors envoie message erreur au client
    }
    // Exclude password from the response
    const { password, ...userInfo } = user.toJSON(); //retire le mdp des données avant de l'envoyer au client (la destructuration de  rest operator "..." donc il extrait password de l'objet et il met tout le reste des propriétés dans userInfo )
    res.send(userInfo); // envoyé des données au client sans mdp

    // console.log(userInfo);
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).send({ message: "Internal server error" }); //si findByPk marche pas alors catch erreur et ca envoie au client l'erreur
  }
};
