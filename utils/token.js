const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../config/database");

const generateAccessToken = (user) => {
    return jwt.sign(
        {      
            user: {
                id: user.id,
                email: user.email,
            }
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
}

const generateRefreshToken = async (userId) => {
    const refreshToken = crypto.randomBytes(40).toString("hex");

    const expiresAt = new Date();
    expiresAt.setDate(
        expiresAt.getDate() + parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN)
    );

    await db.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [userId, refreshToken, expiresAt]
    );

    return refreshToken;
}

const verifyRefreshToken = async (token) => {
    const result = await db.query(
        "SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()",
        [token]
    );

    if(result.rows.length === 0){
        throw new Error("Invalid or expired refresh token!")
    }

    return result.rows[0];
}


const deleteRefreshToken = async (token) => {
  await db.query(
        "DELETE FROM refresh_tokens WHERE token = $1", 
        [token]
    );
};


const deleteAllUserRefreshTokens = async (userId) => {
  await db.query(
        "DELETE FROM refresh_tokens WHERE user_id = $1", 
        [userId]
    );
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    deleteRefreshToken,
    deleteAllUserRefreshTokens
}