// controllers/projectController.js
const {
  Project,
  ProjectPage,
  Data,
  User,
  ProjectUser,
} = require("../models/db"); // Adjust the path to import from models/db
const userActivityController = require("./userActivityController");
//ici on export la fct async appelé getProjects
exports.getProjects = async (req, res) => {
  const userId = req.user.userId;

  try {
    // Projets que l'utilisateur a créés
    const ownedProjects = await Project.findAll({
      where: { userId },
      include: [
        {
          model: User,
          as: "user", //  alias obligatoire ici
          attributes: ["email"],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    // Projets partagés avec l'utilisateur
    const sharedProjects = await Project.findAll({
      include: [
        {
          model: User,
          as: "sharedUsers", //  alias ici aussi
          where: { id: userId },
          attributes: [],
          through: { attributes: [] }, // désactive les infos inutiles de la table pivot
        },
        {
          model: User,
          as: "user", // encore alias ici pour éviter le conflit
          attributes: ["email"],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    // Fusion des deux sans doublons
    const allProjects = [
      ...ownedProjects,
      ...sharedProjects.filter(
        (shared) => !ownedProjects.some((own) => own.id === shared.id)
      ),
    ];

    res.status(200).json(allProjects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};

// fonction async pour création de projects qui va être export
exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body; // ca récupère le name et la description mis par le client (client --> serveur)
    const newProject = await Project.create({
      name,
      description,
      userId: req.user.userId,
    }); // on crée une nouvelle ligne de la base de donnée avec sequelize donc ca insere dans la table project (name et description) les données rajoutés par le client
    await userActivityController.logActivity(
      req.user.userId,
      req.user.userEmail,
      "create",
      `Project created with name ${name}`
    ); // ici ca log dans "createProject" donc on aura l'info de user avec la création de project et le name
    res
      .status(201)
      .send({ message: "Project created successfully", project: newProject }); // ca envoie le message au client pour dire le project a été créé
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).send({ message: "Internal server error" }); // si catch alors erreur
  }
};
// fonction async pour partage de projects entre users qui va être export
exports.shareProject = async (req, res) => {
  const { projectId } = req.params;
  const { targetEmail } = req.body;

  try {
    const project = await Project.findByPk(projectId);
    if (!project) return res.status(404).send({ message: "Project not found" });

    // Vérifie que l'user qui partage est autorisé
    const isSharedOrOwner = await ProjectUser.findOne({
      where: { projectId, userId: req.user.userId },
    });

    if (!isSharedOrOwner && project.userId !== req.user.userId) {
      return res
        .status(403)
        .send({ message: "Not authorized to share this project" });
    }

    // Trouver l'user à partir de son email
    const targetUser = await User.findOne({ where: { email: targetEmail } });
    if (!targetUser) {
      return res
        .status(404)
        .send({ message: "User with this email not found" });
    }

    // Vérifier si le projet est déjà partagé
    const alreadyShared = await ProjectUser.findOne({
      where: { projectId, userId: targetUser.id },
    });

    if (alreadyShared) {
      return res
        .status(409)
        .send({ message: "Project already shared with this user" });
    }

    // Partager le projet
    await ProjectUser.create({
      userId: targetUser.id,
      projectId: projectId,
    });

    res.status(200).send({ message: "Project shared successfully" });
  } catch (error) {
    console.error("Error sharing project:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};

// permet de recuperer le DroppedItems
exports.getDroppedItems = async (req, res) => {
  const { projectId, page } = req.params; //ici on recupère deux paramètre vers le client (projectId et page exemple Id:1 et page : dashboard)

  try {
    //ici tu cherche dans data base le projectId et la page
    const projectPage = await ProjectPage.findOne({
      where: {
        projectId,
        page,
      },
    });
    // si ca existe ces deux parametre alors
    if (projectPage) {
      res.json(projectPage.droppedItems); // on envoie au client le contenu de droppedItems sous format de json
    } else {
      res.json([]); // sinon on envoie rien genre un tableau vide JSON c'est a dire qu'il n'y a pas
    }
  } catch (error) {
    res.status(500).json({ error: error.message }); // si findOne  ne marche pas alors erreur qui envoie un message d'erreur au client
  }
};
// donc ici c'est update de droppeditems ou create droppedItems
exports.UpdateDroppedItems = async (req, res) => {
  const { projectId, page } = req.params; // on recupere le projectId et la page depuis l'URL
  const { droppedItems } = req.body; // ici on recupere depuis le corps de la requête droppedItems qui contient les éléments droppedItems et leurs positions
  // ici on cherche dans la base de données projectId et page
  try {
    const projectPage = await ProjectPage.findOne({
      where: {
        projectId,
        page,
      },
    });
    // si ca existe alors on va remplacer les anciens droppedItems par les nouveaux | lastModified ==> va mettre les modif qu'on a fait dans le project
    if (projectPage) {
      projectPage.droppedItems = droppedItems;
      await projectPage.save(); // on sauvegarde les changements
      await Project.update(
        { lastModified: new Date() },
        { where: { id: projectId } }
      );
    } else {
      //sinon on crée une nouvelle page project avec le ID , projectId , page et droppedItems
      await ProjectPage.create({
        id: `${projectId}-${page}`,
        projectId,
        page,
        droppedItems,
      });
    }

    res.status(201).json({ message: "Dropped items saved successfully" }); // ici dans les deux cas si on fait la mise à jour ou la création on envoie un message au client pour dire que le DroppedItems a été sauvegardé
  } catch (error) {
    res.status(500).json({ error: error.message }); // si erreur alors on envoie un message erreur au client
  }
};
//permet de récuperer ou créer les données de config liées aux topics d'un projet
exports.getProjectData = async (req, res) => {
  const { projectId } = req.params; // ici on recupère le projectId depuis l'url qui vient de la part de client (client --> serveur)
  const { topics } = req.body; //ici on recupere depuis le corps de la requete topics qui vient de
  try {
    //ici cette méthode findOrCreate (qui vient de Sequelize) va chercher une ligne dans la table Data + exactements dans l'attribut projectId où y a des datas et si elle n'existe pas la crée
    // Find or create the data record associated with the projectId and topicName
    const [data, created] = await Data.findOrCreate({
      where: {
        projectId,
      },
      defaults: {
        projectId,
        data: topics.map((topicName) => ({
          topicName,
          minLimit: 0,
          maxLimit: 0,
        })),
      },
    }); // donc ici si elle ne trouve pas alors elle crée donc defaults :{...} avec le champs ci-dessous

    res.status(200).json(data); // ici ca envoie au client les data sous format json don c'est OK
  } catch (error) {
    res.status(500).json({ error: error.message }); // ici si c'est error alors catch ca envoie au client un message d'erreur
  }
};
exports.updateProjectData = async (req, res) => {
  const { projectId } = req.params; // ici on recupere le projectId qui vient vers le client dans l'url
  const { minLimit, maxLimit, topicName } = req.body; // ici on recupere ces parametre dans le corps de la requete qui vient de client
  // ici on cherche dans la table Data la ligne lié a ce projet dans l'attribut projectId
  try {
    let data = await Data.findOne({
      where: {
        projectId,
      },
    });
    //s'il n'y a pas alors ca envoie au client un message d'erreur
    if (!data) {
      res.status(404).json({ error: "Data record not found" });
      return;
    }
    //ici on parcours tous les elements dans data.data puis on verifie si c'est le bon topic si c'est bon on fait une mise à jour
    // Update the data record with new minLimit and maxLimit values
    data.data.array.forEach((element) => {
      if (element.topicName === topicName) {
        element.minLimit = minLimit;
        element.maxLimit = maxLimit;
      }
    });
    // ici on sauvegarde
    await data.save();
    res.status(200).json(data); // puis on envoie un message Ok au client
  } catch (error) {
    res.status(500).json({ error: error.message }); // si catch alors on envoie un message d'erreur au client
  }
};
//pour supprimer les projects du coup on a besoin de "projectId"
exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    await Project.destroy({ where: { id: projectId } });

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
};
