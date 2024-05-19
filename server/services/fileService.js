const fs = require('fs')
const File = require('../models/File')
const config = require('config')

class FileService {

    createDir(file) {
        const filePath = `${config.get('filePath')}\\${file.user}\\${file.path}`
        return new Promise(((resolve, reject) => {
            try {
                if (!fs.existsSync(filePath)) {
                    fs.mkdirSync(filePath)
                    return resolve({message: 'File was created'})
                } else {
                    return reject({message: "File already exist"})
                }
            } catch (e) {
                return reject({message: 'File error'})
            }
        }))
    }

    deleteFile(file) {
        const path = this.getPath(file)
        if (file.type === 'dir') {
            fs.rmdirSync(path)
        } else {
            fs.unlinkSync(path)
        }
    }

    deleteDir(file) {
        const path = this.getPath(file);
        if (file.type === 'dir') {
            const dirPath = `${path}\\`;
            if (fs.existsSync(dirPath)) {
                fs.rmdirSync(dirPath);
            }
        } else {
            fs.unlinkSync(path);
        }
    }


    getPath(file) {
        return config.get('filePath') + '\\' + file.user + '\\' + file.path
    }


    async deleteUserFiles(userId) {
        try {
            const files = await File.find({ user: userId });

            for (const file of files) {
                if (file.type === 'dir') {
                    this.deleteDir(file);
                } else {
                    fs.unlinkSync(this.getPath(file));
                }
                await File.deleteOne({ _id: file._id });
            }
        } catch (e) {
            console.error(e);
            throw new Error('Error deleting user files');
        }
    }



}

module.exports = new FileService()