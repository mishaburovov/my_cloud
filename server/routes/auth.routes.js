const Router = require("express");
const User = require("../models/User")
const Role = require("../models/Role")
const File = require('../models/File')
const Message = require("../models/Message")
const Conversation = require("../models/Conversation");
const bcrypt = require("bcryptjs")
const config = require("config")
const jwt = require("jsonwebtoken")
const {check, validationResult} = require("express-validator")
const router = new Router()
const authMiddleware = require('../middleware/auth.middleware')
const roleMiddleware = require('../middleware/role.middleware')
const fileService = require('../services/fileService')


router.post('/registration',
    [
        check('email', "Uncorrect email").isEmail(),
        check('password', 'Password must be longer than 3 and shorter than 12').isLength({min:3, max:12})
    ],
    async (req, res) => {
    try {
        console.log(req.body)
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({message: "Uncorrect request", errors})
        }

        const {email, password} = req.body;

        const candidate = await User.findOne({email: email})

        if(candidate) {
            return res.status(400).json({message: `User with email ${email} already exist`})
        }
        const hashPassword = await bcrypt.hash(password, 15)
        const userRole = await Role.findOne({value: "USER"})
        const user = new User({email, password: hashPassword, roles: [userRole.value]})
        await user.save()


        
        const admin = await User.findOne({ roles: { $in: ["ADMIN"] } });
            const newConversation = new Conversation({ members: [user.id, admin.id] });
            await newConversation.save();
            await new Message({ conversationId: newConversation._id, senderId: admin.id, messageText: 'Welcome to the platform!' }).save();





        await fileService.createDir(new File({user:user.id, name: ''}))
        return res.json({message: "User was created"})

    } catch (e) {
        console.log(e)
        res.send({message: "Server error"})
    }
})

router.post('/login',
    async (req, res) => {
        try {
            const {email, password} = req.body
            const user = await User.findOne({email})
            console.log(user)
            if (!user) {
                return res.status(404).json({message: "User not found"})
            }
            const isPassValid = bcrypt.compareSync(password, user.password)
            if (!isPassValid) {
                return res.status(400).json({message: "Invalid password"})
            }
            const token = jwt.sign({id: user.id, roles: user.roles}, config.get("secretKey"), {expiresIn: "1h"})
            return res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    diskSpace: user.diskSpace,
                    usedSpace: user.usedSpace,
                    avatar: user.avatar,
                    roles: user.roles
                }
            })
        } catch (e) {
            console.log(e)
            res.send({message: "Server error"})
        }
    })

    router.get('/auth', authMiddleware,
    async (req, res) => {
        try {
            const user = await User.findOne({_id: req.user.id})
            const token = jwt.sign({id: user.id, roles: user.roles}, config.get("secretKey"), {expiresIn: "1h"})
            return res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    diskSpace: user.diskSpace,
                    usedSpace: user.usedSpace,
                    avatar: user.avatar,
                    roles: user.roles
                }
            })
        } catch (e) {
            console.log(e)
            res.send({message: "Server error"})
        }
    })

    router.get('/users', authMiddleware, roleMiddleware(['ADMIN']), async (req, res) => {
        try {
            const users = await User.find().select('-password');
            res.json(users);
        } catch (e) {
            console.log(e);
            res.status(500).send({ message: "Server error" });
        }
    });



    const deleteRelatedConversations = async (userId) => {
        try {
            const conversations = await Conversation.find({ members: userId });
    
            for (const conversation of conversations) {
                await Message.deleteMany({ conversationId: conversation._id });
            }
            
            await Conversation.deleteMany({ members: userId });
        } catch (e) {
            console.error(e);
            throw new Error('Error deleting user conversations');
        }
    };
    
    router.delete('/users/:id', authMiddleware, roleMiddleware(['ADMIN']), async (req, res) => {
        try {
            const userId = req.params.id;
    
            
            await fileService.deleteUserFiles(userId);
    
            
            await deleteRelatedConversations(userId);
    
            const result = await User.deleteOne({ _id: userId });
    
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }
            
            return res.json({ message: 'Пользователь удален' });
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    });
    
    module.exports = router;


    router.post('/increaseDiskSpace', authMiddleware, roleMiddleware(['ADMIN']), async (req, res) => {
        const { userId, increaseAmount } = req.body;
     
        if (![1, 5, 10].includes(increaseAmount)) {
            return res.status(400).json({ message: "Invalid increment amount specified. Choose either 1 GB, 5 GB, or 10 GB." });
        }
     
        const bytesPerGB = 1024 ** 3;
        const additionalSpace = increaseAmount * bytesPerGB;
     
        const user = await User.findById(userId);
        if (user && user.roles.includes("USER")) {
            user.diskSpace += additionalSpace;
            await user.save();
            return res.json({ message: "Disk space increased successfully", newDiskSpace: user.diskSpace });
        } else {
            return res.status(400).json({ message: "User not found or does not have the role 'USER'" });
        }
     });


     router.get('/profile', authMiddleware,
     async (req, res) => {
         try {
             const user = await User.findOne({_id: req.user.id}).select('-password');
             return res.json(user);
         } catch (e) {
             console.log(e);
             res.status(500).send({ message: "Server error" });
         }
     }); 
module.exports = router