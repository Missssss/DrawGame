require('dotenv').config();
const bcrypt = require('bcrypt');
const got = require('got');
const {pool} = require('./mysqlcon');
const salt = parseInt(process.env.BCRYPT_SALT);
const {TOKEN_EXPIRE, TOKEN_SECRET} = process.env; // 30 days by seconds
const jwt = require('jsonwebtoken');

const USER_ROLE = {
    ADMIN: 1,
    USER: 2
};

const signUp = async (name, roleId, email, password) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');

        const emails = await conn.query('SELECT email FROM user WHERE email = ? FOR UPDATE', [email]);
        if (emails[0].length > 0){
            await conn.query('COMMIT');
            return {error: 'Email Already Exists'};
        }

        const user = {
            provider: 'native',
            role_id: roleId,
            email: email,
            password: bcrypt.hashSync(password, salt),
            name: name,
            picture: null,
            access_expired: TOKEN_EXPIRE,
        };
        const accessToken = jwt.sign({
            provider: user.provider,
            name: user.name,
            email: user.email,
            picture: user.picture
        }, TOKEN_SECRET, { expiresIn: TOKEN_EXPIRE});
        user.access_token = accessToken;

        const queryStr = 'INSERT INTO user SET ?';
        const [result] = await conn.query(queryStr, user);

        user.id = result.insertId;
        user.login_at = new Date();
        await conn.query('COMMIT');
        return {user};
    } catch (error) {
        console.log(error);
        await conn.query('ROLLBACK');
        return {error};
    } finally {
        await conn.release();
    }
};

const nativeSignIn = async (email, password) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');

        const [users] = await conn.query('SELECT * FROM user WHERE email = ?', [email]);
        const user = users[0];
        if (!bcrypt.compareSync(password, user.password)){
            await conn.query('COMMIT');
            return {error: 'Password is wrong'};
        }

        const accessToken = jwt.sign({
            provider: user.provider,
            name: user.name,
            email: user.email,
            picture: user.picture
        }, TOKEN_SECRET, { expiresIn: TOKEN_EXPIRE});

        const queryStr = 'UPDATE user SET access_token = ?, access_expired = ? WHERE id = ?';
        await conn.query(queryStr, [accessToken, TOKEN_EXPIRE, user.id]);

        await conn.query('COMMIT');

        user.access_token = accessToken;
        user.login_at = new Date();
        user.access_expired = TOKEN_EXPIRE;

        return {user};
    } catch (error) {
        await conn.query('ROLLBACK');
        return {error};
    } finally {
        await conn.release();
    }
};


module.exports = {
    USER_ROLE,
    signUp,
    nativeSignIn
};