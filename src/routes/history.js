const express = require('express');
const Auth = require('../middleware/auth');
const router = express.Router();
const History = require('../models/History');
const User = require('../models/User');


router.post('/', Auth.AuthentificationUser, async(req, res) => {
    // Adding a new history
    try{
        if (req.body.mode !== 'driving' && (req.body.mode !== 'walking') && (req.body.mode !== 'bicycling')) res.status(400).send({success: false, message: 'Invalid travel mode'});

        const user = req.user._id;
        req.body.user_id = user._id;

        const history = new History(req.body);
        await history.save();

        history.user_id = undefined;
        history.__v = undefined;

        res.status(201).send({
            success: true,
            history : history,
        });
    }
    catch(error){
        if(error.path === "_id") return res.status(400).send({success:false, message:"Invalid user ID"});
        return res.status(400).send({success: false, message: error});
    }
})

// route de suppression
router.delete('/', Auth.AuthentificationUser, async(req, res) => {
    try{
        const user_id = req.user._id;
        const { id } = req.body; // récupération des valeurs dans req.body

        if(!user_id) return res.status(400).send({success:false,message:"User ID is missing"}); // Vérification de si user_id existe

        if(!id) return res.status(400).send({success:false,message:"History ID is missing"}); // Vérification de si id existe

        await User.findOne({ _id: user_id }); // Regarde si l'utilisateur existe "pas obligatoire"
        
        const toDeleteHistory = await History.findOne({ _id: id, user_id: user_id }); // Regarde si l'historique existe et si il existe, le stocker dans une variable

        if (!toDeleteHistory) return res.status(400).send({success:false,message:"Nothing to delete with this ID"});

        await History.deleteOne(toDeleteHistory); // Supprime l'historique

        res.status(200).send({ // Ca c'est bien paaasé
            success: true,
        });
    }
    catch(error){
        if(error.path === "_id") return res.status(400).send({success:false,message:"Invalid user or history ID"});
        return res.status(400).send({success:false,message:error}); // Il y a une erreur
    }
})

// route de récupération (par utilisateur) des courses (historique d'une seul utilisateur)

router.get('/', Auth.AuthentificationUser,  async(req, res) => {
    try{
        const user= req.user;

        const userHistoric =await History.find({ user_id: user._id});
        
        userHistoric.map((item) => {
            item.user_id = undefined;
            item.__v = undefined;
            return item;
        })

        const ret = {success : true};
        ret.histories = userHistoric;
        res.send(ret);
    }
    catch(error){
        return res.status(400).send({success:false,message:error});
    }
})

module.exports = router;