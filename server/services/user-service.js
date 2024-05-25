const UserModel = require('../models/User');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const File = require('../models/File')
const fileService = require('../services/fileService')

class UserService {
    async registration(email, password) {
        const candidate = await UserModel.findOne({email})
        if (candidate) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`)
        }
        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4();
        const user = await UserModel.create({email, password: hashPassword, activationLink, roles: ["USER"]});
        try{
            await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);
        }
            catch(e){
                console.log(e.message)
            }
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        const admin = await UserModel.findOne({ roles: { $in: ["ADMIN"] } });
        const newConversation = new Conversation({ members: [user.id, admin.id] });
        await newConversation.save();
        await new Message({ conversationId: newConversation._id, senderId: admin.id, 
        messageText: 'Welcome to the platform!' }).save();
        await fileService.createDir(new File({user: user._id, name: ''}))
        return {...tokens, user: userDto}
        
    }


    async activate(activationLink) {
        const user = await UserModel.findOne({activationLink})
        if (!user) {
            throw ApiError.BadRequest('Неккоректная ссылка активации')
        }
        user.isActivated = true;
        await user.save();
    }

    async login(email, password) {
        const user = await UserModel.findOne({email})
        if (!user) {
            throw ApiError.BadRequest('Пользователь с таким email не найден')
        }
        const isPassEquals = await bcrypt.compare(password, user.password);
        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль');
        }
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto}
    }


    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);
        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }
        const user = await UserModel.findById(userData.id);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto}
    }

        async checkAuth(userId) {
            const user = await UserModel.findById(userId).select('-password');
            if (!user) {
                throw ApiError.UnauthorizedError();
            }
            const userDto = new UserDto(user);
            return userDto;
        }

        async getUsersWithRole(role) {
            const users = await UserModel.find({ roles: role }).select('-password');
            return users;
        }


         /////////////////////////////////НОВОЕ

         async deleteUser(userId) {
            const user = await UserModel.findById(userId);
            if (!user) {
                throw ApiError.BadRequest('Пользователь не найден');
            }
    
            // Удаление разговоров и сообщений
            const conversations = await Conversation.find({ members: user._id });
            for (const conversation of conversations) {
                await Message.deleteMany({ conversationId: conversation._id });
                await Conversation.deleteOne({ _id: conversation._id });
            }
    
            // // Удаление файлов пользователя
            // const userFiles = await File.find({ user: user._id });
            // for (const file of userFiles) {
            //     await fileService.deleteFile(file._id);
            // }
    
            await UserModel.deleteOne({ _id: user._id });
        }
    

        
}

module.exports = new UserService();