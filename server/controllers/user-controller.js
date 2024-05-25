const userService = require('../services/user-service');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/api-error');
const Conversation = require("../models/Conversation");
const UserModel = require('../models/User');

class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }
            const {email, password} = req.body;
            const userData = await userService.registration(email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }


    async login(req, res, next) {
        try {
            const {email, password} = req.body;
            const userData = await userService.login(email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);
        } catch (e) {
            next(e);
        }
    }

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link;
            await userService.activate(activationLink);
            return res.redirect(process.env.CLIENT_URL);
        } catch (e) {
            next(e);
        }
    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }


      
     async profile(req, res, next){
         try {
             const user = await UserModel.findOne({_id: req.user.id}).select('-password');
             return res.json(user);
         } catch (e) {
            next(e);
         }
    }


      async increaseDiskSpace(req, res, next){
        const { userId, increaseAmount } = req.body;
        if (![1, 5, 10].includes(increaseAmount)) {
            return res.status(400).json({ message: "Invalid increment amount specified. Choose either 1 GB, 5 GB, or 10 GB." });
        }
        const bytesPerGB = 1024 ** 3;
        const additionalSpace = increaseAmount * bytesPerGB;
     
        const user = await UserModel.findById(userId);
        if (user && user.roles.includes("USER")) {
            user.diskSpace += additionalSpace;
            await user.save();
            return res.json({ message: "Disk space increased successfully", newDiskSpace: user.diskSpace });
        } else {
            return next(ApiError.BadRequest("User not found or does not have the role 'USER'"));
        }
     };



    async deleteUser(req, res, next) {
        try {
            const userId = req.params.id;
            await userService.deleteUser(userId);
            res.json({ message: "Пользователь успешно удален" });
        } catch (e) {
            next(e);
        }
    }



    async getUsers(req, res, next) {
        try {
            const users = await userService.getUsersWithRole('USER');
            res.json(users);
        } catch (e) {
            next(e);
        }
    };



    async checkAuth(req, res, next) {
        try {
            const user = await userService.checkAuth(req.user.id);
            return res.json(user);
        } catch (e) {
            next(e);
        }
    }
}
module.exports = new UserController();