const Router = require('express').Router;
const userController = require('../controllers/user-controller');
const router = new Router();
const {body} = require('express-validator');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');



router.post('/registration',
    body('email').isEmail(),
    body('password').isLength({min: 3, max: 32}),
    userController.registration
);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);
router.get('/profile', authMiddleware, userController.profile);
router.post('/increaseDiskSpace', authMiddleware, roleMiddleware(['ADMIN']), userController.increaseDiskSpace);
router.delete('/users/:id', authMiddleware, roleMiddleware(['ADMIN']), userController.deleteUser);
router.get('/users', authMiddleware, roleMiddleware(['ADMIN']), userController.getUsers);
router.get('/auth', authMiddleware, userController.checkAuth);
////////////////////новое




module.exports = router