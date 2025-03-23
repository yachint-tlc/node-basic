const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../config/database')
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    deleteRefreshToken,
    deleteAllUserRefreshTokens
} = require('../utils/token');

exports.register = async (req, res, next) => {
    try {
        const { email, password, full_name } = req.body;

        const userCheck = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        const result = await db.query(
            'INSERT INTO users (email, password, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name',
            [email, hashedPassword, full_name]
        );

        res.status(201).json({
            error: false,
            msg: "User created successfully!",
            data: result.rows[0]
        });

    } catch(err) {
        res.status(500)
        next(err)
    }
}

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const result = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if(result.rows.length === 0){
            return res.status(401).json({
                error: true,
                msg: "Invalid credentials"
            });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({
                error: true,
                msg: "Invalid credentials"
            });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = await generateRefreshToken(user.id);

        res.json({
            accessToken,
            refreshToken,
        });
    } catch(err) {
        console.log(err)
        res.status(500)
        next(err)
    }
}

exports.refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        const tokenData = await verifyRefreshToken(refreshToken);
    
        const userResult = await db.query("SELECT * FROM users WHERE id = $1", 
            [ tokenData.user_id ]
        );
    
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
    
        const user = userResult.rows[0];

        const accessToken = generateAccessToken(user);
        await deleteRefreshToken(refreshToken);
        const newRefreshToken = await generateRefreshToken(user.id);


        res.json({
            accessToken,
            refreshToken: newRefreshToken
        });

    } catch(err) {
        console.log(err);
        if (err.message === "Invalid or expired refresh token!") {
            return res.status(401).json({
                err: true, 
                msg: err.message 
            });
        }

        res.status(500);
        next(err);
    }
}

exports.logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
    
        if (refreshToken) {
            await deleteRefreshToken(refreshToken);
        }
    
        res.status(200).json({ 
            error: false,
            msg: "Logged out successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500);
        next(err);
    }
}

exports.logoutAll = async (req, res, next) => {
    try {
        await deleteAllUserRefreshTokens(req.user.id);

        res.status(200).json({
            error: false,
            msg: "Logged out of all devices successfully"
        })
    } catch(err) {
        console.log(err);
        res.status(500);
        next(err);
    }
}