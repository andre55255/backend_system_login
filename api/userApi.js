const userModel = require("../db/models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validation = require("../validations/user");
const emailService = require("../services/email");

function createUser() {
    return async function(req, res) {
        const {
            name,
            email,
            password
        } = req.body;

        if (!name || !email || !password) {
            return res.status(422).json({ error: "Name, email e password is required" });
        }

        if (!validation.name(name)) {
            return res.status(422).json({
                error: "Please, inform fullname"
            });
        }

        if (!validation.email(email)) {
            return res.status(422).json({
                error: "Email invalid"
            });
        }

        if (!validation.password(password)) {
            return res.status(422).json({
                error: "Password not accepted"
            });
        }

        const userDB = await userModel.findOne({ email });

        if (userDB) {
            return res.status(409).json({
                error: "Email is already exists"
            });
        }

        try {
            bcrypt.hash(password, 10, async (err, hash) => {
                if (err) {
                    return res.status(500).json({
                        error: "Failed to encrypted password"
                    });
                }

                const user = {
                    name,
                    email,
                    password: hash
                }
                
                const userCreated = await userModel.create(user);

                return res.status(201).json({
                    message: "User created successfully",
                    id: userCreated._id
                });
            });
        } catch (err) {
            return res.status(500).json({
                error: "Failed to create user"
            });
        }
    }
}

function signInUser() {
    return async function(req, res) {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(422).json({ error: "Email and password is required" });
        }

        if (!validation.email(email)) {
            return res.status(422).json({
                error: "Email invalid format"
            });
        }

        if (!validation.password(password)) {
            return res.status(422).json({
                error: "Password not accepted"
            });
        }

        let user;

        try {
            user = await userModel.findOne({ email });
        } catch (err) {
            return res.status(500).json({ error: "Operation failed" });
        }

        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        bcrypt.compare(password, user.password, (err, result) => {
            if (err || !result) {
                return res.status(401).json({ error: "Password incorrect" });
            }

            if (result) {
                const token = jwt.sign({
                    id_user: user._id,
                    email_user: user.email
                }, process.env.JWT_SECRET, {
                    expiresIn: "1h"
                });

                return res.status(200).json({
                    token,
                    name: user.name,
                    message: "User authenticated successfully"
                });
            }
        });
    }
}

function forgotPasswordStepOne() {
    return async function(req, res) {
        const { email } = req.body;

        if (!email || !validation.email(email)) {
            return res.status(422).json({
                error: "Email invalid"
            });
        }

        try {
            const user = await userModel.findOne({ email });
            
            if (!user) {
                return res.status(422).json({ error: "Ops, user not found" });
            }

            bcrypt.hash(email, 10, async(err, hash) => {
                if (err || !hash) {
                    return res.status(500).json({
                        error: "Failed to read email in db"
                    });
                }

                const newUser = {
                    name: user.name,
                    email: user.email,
                    password: user.password,
                    token: hash
                }

                const userUpdated = await userModel.updateOne({ _id: user._id }, newUser);

                if (userUpdated.matchedCount === 0) {
                    return res.status(422).json({ error: "Failed try forgot password" });
                }

                emailService.send(
                    email,
                    "Recuperação de senha",
                    `Olá ${user.name},\n segue o token para redefinição de senha: ${hash} \nAtenciosamente André Luiz Barros`,
                    `Olá <strong>${user.name}</strong>,</br></br>Segue o token para redefinição de senha: <strong>${hash}</strong></br></br>Atenciosamente,</br>André Luiz Barros`
                )
                .then(resp => {
                    if (resp.accepted.length > 0 || resp.messageId) {
                        return res.status(200).json({
                            message: "Email sender success > "+user.email
                        });
                    } else if (resp.rejected.length > 0 || !resp.messageId) {
                        return res.status(422).json({
                            message: "Email invalid, contact admnistrator system"
                        });
                    }
                })
                .catch(err => {
                    console.log(err);
                    return res.status(422).json({
                        message: "Email invalid, contact admnistrator system"
                    });
                });
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                error: "Failed to read email in db"
            });
        }
    }
}

function forgotPasswordValidToken() {
    return async function(req, res) {
        const { token } = req.body;

        if (!token) {
            return res.status(422).json({ error: "Token is required" });
        }

        try {
            const user = await userModel.findOne({ token });

            if (!user) {
                return res.status(404).json({ error: "User not found or token invalid" });
            }

            return res.status(200).json({ email: user.email, token: token });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ error: "User not found or token invalid" });
        }
    }
}

function forgotPasswordStepTwo() {
    return async function(req, res) {
        const {
            email,
            token,
            password
        } = req.body;

        if (!token || !password) {
            return res.status(422).json({ error: "Token and password are required" });
        }

        if (!validation.password(password)) {
            return res.status(422).json({ error: "Password is not accepted" });
        }

        try {
            const user = await userModel.findOne({ email, token });
            
            if (!user) {
                return res.status(422).json({ error: "User not found or token invalid" });
            }

            bcrypt.hash(password, 10, async (err, hash) => {
                if (err || !hash) {
                    return res.status(500).json({ error: "Failed operation" });
                }
                
                const userUpdate = {
                    name: user.name,
                    email: user.email,
                    password: hash,
                    token: user.token
                }

                const userUpdated = await userModel.updateOne({ _id: user._id }, userUpdate);

                if (userUpdated.matchedCount === 0) {
                    return res.status(500).json({ error: "Failed operation" });
                }

                return res.status(200).json({ message: "User updated successfully" });
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ error: "Failed operation" });
        }
    }
}

function verifyToken() {
    return function(req, res) {
        if (req.user) {
            return res.status(200).json({ message: "Token valid" });
        } else {
            return res.status(401).json({ error: "Token invalid" });
        }
    }
}

module.exports = {
    createUser,
    signInUser,
    forgotPasswordStepOne,
    forgotPasswordValidToken,
    forgotPasswordStepTwo,
    verifyToken
}