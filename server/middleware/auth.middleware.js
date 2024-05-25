// const jwt = require('jsonwebtoken')
// const config = require('config')

// module.exports = (req, res, next) => {
//     if (req.method === 'OPTIONS') {
//        return next()
//     }

//     try {
//         const token = req.headers.authorization.split(' ')[1]
//         if (!token) {
//             return res.status(401).json({message: 'Auth error'})
//         }
//         const decoded = jwt.verify(token, config.get('secretKey'))
//         req.user = decoded
//         next()
//     } catch (e) {
//         return res.status(401).json({message: 'Auth error'})
//     }
// }

// const jwt = require('jsonwebtoken');
// const config = require('config');

// module.exports = (req, res, next) => {
//     if (req.method === 'OPTIONS') {
//         return next();
//     }

//     try {
//         const token = req.headers.authorization.split(' ')[1]; // Получение токена из заголовков
//         if (!token) {
//             return res.status(401).json({ message: 'Auth error' });
//         }
//         const decoded = jwt.verify(token, config.get('secretKey')); // Декодирование токена
//         req.user = decoded; // Сохранение токена в объекте запроса
//         next();
//     } catch (e) {
//         return res.status(401).json({ message: 'Auth error' });
//     }
// }


const ApiError = require('../exceptions/api-error');
const tokenService = require('../services/token-service');

module.exports = function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return next(ApiError.UnauthorizedError());
        }

        const accessToken = authorizationHeader.split(' ')[1];
        if (!accessToken) {
            return next(ApiError.UnauthorizedError());
        }

        const userData = tokenService.validateAccessToken(accessToken);
        if (!userData) {
            return next(ApiError.UnauthorizedError());
        }

        req.user = userData;
        next();
    } catch (e) {
        return next(ApiError.UnauthorizedError());
    }
};