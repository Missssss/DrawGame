require('dotenv').config();
const validator = require('validator');
const User = require('../models/userModel');


let newNumber = 0
const getUserId =  async (req, res) => {
    newNumber++;
    let userId = "User"+(Array(6).join('0') + newNumber).slice(-6);
    console.log("getUserId: ", userId)
    res.status(200).send({userId:userId}) ; 
}

const signUp = async (req, res) => {
    let {name} = req.body;
    const {email, password} = req.body;

    if(!name || !email || !password) {
        res.status(400).send({error:'Request Error: name, email and password are required.'});
        return;
    }

    if (!validator.isEmail(email)) {
        res.status(400).send({error:'Request Error: Invalid email format'});
        return;
    }

    name = validator.escape(name);
    
    const result = await User.signUp(name, User.USER_ROLE.USER, email, password);
    if (result.error) {
        res.status(403).send({error: result.error});
        return;
    }

    const user = result.user;
    if (!user) {
        res.status(500).send({error: 'Database Query Error'});
        return;
    }

    res.status(200).send({
        data: {
            access_token: user.access_token,
            access_expired: user.access_expired,
            login_at: user.login_at,
            user: {
                id: user.id,
                provider: user.provider,
                name: user.name,
                email: user.email,
                picture: user.picture
            }
        }
    });
};


module.exports = {
    getUserId,
    signUp,
};