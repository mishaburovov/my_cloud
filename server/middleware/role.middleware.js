// const jwt = require('jsonwebtoken')
// const {secretKey} = require("../config/default.json")


// module.exports = function (roles) {
//     return function (req, res, next) {
//         if (req.method === "OPTIONS") {
//             next()
//         }

//         try {
//             const token = req.headers.authorization.split(' ')[1]
//             if (!token) {
//                 return res.status(403).json({message: "Пользователь не авторизован"})
//             }
//             const {roles: userRoles} = jwt.verify(token, secretKey)
//             let hasRole = false
//             userRoles.forEach(role => {
//                 if (roles.includes(role)) {
//                     hasRole = true
//                 }
//             })
//             if (!hasRole) {
//                 return res.status(403).json({message: "У вас нет доступа"})
//             }
//             next();
//         } catch (e) {
//             console.log(e)
//             return res.status(403).json({message: "Пользователь не авторизован"})
//         }
//     }
// };



// const jwt = require('jsonwebtoken');
// const config = require('config');

// module.exports = function (roles) {
//     return function (req, res, next) {
//         if (req.method === "OPTIONS") {
//             next();
//         }

//         try {
//             const token = req.headers.authorization.split(' ')[1];
//             if (!token) {
//                 return res.status(403).json({ message: "Пользователь не авторизован" });
//             }
//             const { roles: userRoles } = jwt.verify(token, config.get('secretKey'));
//             let hasRole = false;
//             userRoles.forEach(role => {
//                 if (roles.includes(role)) {
//                     hasRole = true;
//                 }
//             });
//             if (!hasRole) {
//                 return res.status(403).json({ message: "У вас нет доступа" });
//             }
//             next();
//         } catch (e) {
//             console.log(e);
//             return res.status(403).json({ message: "Пользователь не авторизован" });
//         }
//     }
// };



const ApiError = require('../exceptions/api-error');

module.exports = function(roles) {
    return function(req, res, next) {
        if (req.method === "OPTIONS") {
            next();
        }

        try {
            const { user } = req;
            if (!user) {
                return next(ApiError.UnauthorizedError());
            }

            let hasRole = false;
            roles.forEach(role => {
                if (user.roles.includes(role)) {
                    hasRole = true;
                }
            });

            if (!hasRole) {
                return next(ApiError.Forbidden('Нет доступа'));
            }

            next();
        } catch (e) {
            return next(ApiError.UnauthorizedError());
        }
    }
}