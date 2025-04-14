const User = require("../models/User");
const Role = require("../models/Role");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { secret } = require("../config");

const generateAccessToken = (id, role) => {
    const payload = {
        id,
        role,
    };
    return jwt.sign(payload, secret, { expiresIn: "24h" });
};

class authController {
    async registration(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(400)
                    .json({ message: "Ошибка при регистрации", errors });
            }
            const { username, password, role } = req.body;
            const candidate = await User.findOne({ username });
            if (candidate) {
                return res
                    .status(400)
                    .json({ message: "Пользователь с таким именем уже существует" });
            }
            const hashPassword = bcrypt.hashSync(password, 7);
            const userRole = await Role.findOne({ value: role ? role : "USER" });
            const user = new User({
                username,
                password: hashPassword,
                role: userRole.value,
            });
            await user.save();
            const token = generateAccessToken(user._id, user.roles);
            return res.json({ message: "Пользователь успешно зарегистрирован", token });
        } catch (e) {
            console.log(e);
            res.status(400).json({ message: "Registration error" });
        }
    }
    async login(req, res) {
        try {
            const { username, password } = req.body;
            const user = await User.findOne({ username });
            if (!user) {
                return res
                    .status(400)
                    .json({ message: `Пользователь ${username} не найден`, errorCode: 400  });
            }
            const validPassword = bcrypt.compareSync(password, user.password);
            if (!validPassword) {
                return res.status(400).json({ message: `Введен неверный пароль`, errorCode: 400 });
            }
            const token = generateAccessToken(user._id, user.role);

            return res.json({ token, user });
        } catch (e) {
            console.log(e);
            res.status(400).json({ message: "Login error", errorCode: 400  });
        }
    }
    async getUser(req, res) {
        try {
            const userId = req.user.id;
            const user = await User.findOne({ _id: userId });
            if (!user) {
                return res.status(403).json({ message: "Пользователь не найден" });
            }
            res.json(user);
        } catch (e) {
            console.log(e);
        }
    }
    async getUsers(req, res) {
        try {
            const users = await User.find();
            res.json(users);
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = new authController();