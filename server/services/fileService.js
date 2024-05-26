const fs = require('fs')
const File = require('../models/File')
const path = require("path")
require('dotenv').config();

class FileService {

    createDir(file) {
      
       const filePath = this.getPath(file)
       console.log(filePath)
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
        const filePath = this.getPath(file);
        if (file.type === 'dir') {
            if (fs.existsSync(filePath)) {
                fs.rmdirSync(filePath);
            }
        } else {
            fs.unlinkSync(filePath);
        }
    }

   


    getPath(file) {
        console.log(process, process.cwd())
        return path.join( 
            path.join(process.cwd(), process.env.FILE_PATH),
            file.user+'', 
            file.path
        )
    }

}

module.exports = new FileService()
