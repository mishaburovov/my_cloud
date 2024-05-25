const UserModel = require('./models/User');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const UserDto = require('./dtos/user-dto');
const tokenService = require('./services/token-service');
const fileService = require('./services/fileService');
require('dotenv').config();

async function initAdmin() {
    try {
        const email = process.env.ADMIN_EMAIL;  
        const password = process.env.ADMIN_PASSWORD; 
        const candidate = await UserModel.findOne({ email });
        if (candidate) {
            console.log(`Admin with email ${email} already exists.`);
            return;
        }

        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4();
        const user = await UserModel.create({ email, password: hashPassword, activationLink, roles: ["ADMIN"], isActivated: true });
        console.log(`Admin created with email ${email}`);

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        await fileService.createDir(new File({ user: user._id, name: '' }));

        console.log('Admin user initialized successfully.');
    } catch (error) {
        console.error('Error initializing admin:', error.message);
    }
}

module.exports = initAdmin;