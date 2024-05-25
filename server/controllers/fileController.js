// const fileService = require('../services/fileService')
// const fs = require('fs')
// const User = require('../models/User')
// const File = require('../models/File')
// const path = require('path');
// const archiver = require('archiver');
// // const Uuid = require('uuid')


// class FileController {

//     async createDir(req, res) {
//         try {
//             const {name, type, parent} = req.body
//             console.log(req.user,req.body)
//             const file = new File({name, type, parent, user: req.user.id})
//             const parentFile = await File.findOne({_id: parent})
//             if(!parentFile) {
//                 file.path = name
//                 await fileService.createDir(file)
//             } else {
//                 // file.path = `${parentFile.path}\\${file.name}`
//                 file.path = path.join(parentFile.path, file.name);
//                 await fileService.createDir(file)
//                 parentFile.childs.push(file._id)
//                 await parentFile.save()
//             }
//             await file.save()
//             return res.json(file)
//         } catch (e) {
//             console.log(e)
//             return res.status(400).json(e)
//         }
//     }


//     async getFiles(req, res) {
//         try {
//             const {sort} = req.query
//             let files
            
//             switch (sort) {
//                 case 'name':
//                     files = await File.find({user: req.user.id, parent: req.query.parent}).sort({name:1})
//                     break
//                 case 'type':
//                     files = await File.find({user: req.user.id, parent: req.query.parent}).sort({type:1})
//                     break
//                 case 'date':
//                     files = await File.find({user: req.user.id, parent: req.query.parent}).sort({date:1})
//                     break
//                 default:
//                     files = await File.find({user: req.user.id, parent: req.query.parent})
//                     break;
//             }

//             return res.json(files)
//         } catch (e) {
//             console.log(e)
//             return res.status(500).json({message: "Can not get files"})
//         }
//     }

//     async uploadFile(req, res) {
//         try {
//             const { file } = req.files;
//             const { parent } = req.body;
//             const user = await User.findOne({ _id: req.user.id });
    
//             if (!file) {
//                 return res.status(400).json({ message: 'Файл не был загружен' });
//             }
    
//             if (user.usedSpace + file.size > user.diskSpace) {
//                 return res.status(400).json({ message: 'Недостаточно места на диске' });
//             }
    
//             user.usedSpace += file.size;
    
//             const parentFile = await File.findOne({ _id: parent });
    
//             let version = 1;
//             let fileName = file.name;
            
//             // let path = `${req.filePath}/${user._id}/${parentFile ? parentFile.path : ''}/${fileName}`;
//             const userFilePath = path.join(req.filePath, user._id.toString());
//             const path = path.join(userFilePath, parentFile ? parentFile.path : '', fileName);
    
//             while (fs.existsSync(path)) {
//                 const indexOfDot = fileName.lastIndexOf('.');
//                 const baseName = indexOfDot !== -1 ? fileName.slice(0, indexOfDot) : fileName;
//                 const extension = indexOfDot !== -1 ? fileName.slice(indexOfDot) : '';
//                 fileName = `${baseName}(${version})${extension}`;
//                 // path = `${req.filePath}/${user._id}/${parentFile ? parentFile.path : ''}/${fileName}`;
//                 path = `${req.filePath}/${user._id}/${parentFile ? parentFile.path : ''}/${fileName}`;
//                 version++;
//             }
    
//             file.mv(path);
    
//             const fileType = fileName.split('.').pop();
    
//             const dbFile = new File({
//                 name: fileName,
//                 type: fileType,
//                 size: file.size,
//                 path: parentFile ? parentFile.path : '',
//                 parent: parentFile ? parentFile._id : null,
//                 user: user._id
//             });
    
//             await dbFile.save();
//             await user.save();
    
//             return res.json(dbFile);
//         } catch (error) {
//             console.log(error);
//             return res.status(500).json({ message: "Ошибка загрузки" });
//         }
//     }

//     async downloadFile(req, res) {
//         const file = await File.findOne({_id: req.query.id, user: req.user.id});
        
//         if (file.type === 'dir') {
//             // const folderPath = path.join(config.get('filePath'), req.user.id, file.path);
//             const folderPath = path.join(req.filePath, req.user.id, file.path);
//             console.log(folderPath)
//             res.writeHead(200, {
//                 'Content-Type': 'application/zip',
//                 'Content-disposition': `attachment; filename=${file.name}.zip`
//             });
    
//             const zip = archiver('zip', { zlib: { level: 9 }});
//             zip.pipe(res);
    
//             async function addFolderToArchive(folderPath, archive, relativePath) {
//                 const items = fs.readdirSync(folderPath);
//                 for (const item of items) {
//                     const itemPath = path.join(folderPath, item);
//                     const stats = fs.statSync(itemPath);
//                     if (stats.isDirectory()) {
//                         await addFolderToArchive(itemPath, archive, path.join(relativePath, item)); 
//                     } else {
//                         archive.append(fs.createReadStream(itemPath), { name: path.join(relativePath, item) }); 
//                     }
//                 }
//             }
    
//             await addFolderToArchive(folderPath, zip, ''); 
          
//             zip.finalize(); // Завершает архивацию и отправляет архив в ответе
//         } else {
//             // Обработка обычного файла
//             // const filePath = path.join(config.get('filePath'), req.user.id, file.path, file.name);
//             const filePath = path.join(req.filePath, req.user.id, file.path, file.name);
//             res.download(filePath);
//         }
//     }


//     async deleteFile(req, res) {
//         try {
//             const file = await File.findOne({_id: req.query.id, user: req.user.id});
//             if (!file) {
//                 return res.status(404).json({message: 'File not found'});
//             }
    
//             let filePath;
//             if (file.type === 'dir') {
//                 // filePath = path.join(config.get('filePath'), req.user.id, file.path);
//                 filePath = path.join(req.filePath, req.user.id, file.path);
//                 console.log(`Attempt to delete directory: ${filePath}`);
//                 if (fs.existsSync(filePath)) {
//                     fileService.deleteDir(req, file); // Вызов метода deleteDir для удаления директории
//                     await File.deleteOne({_id: req.query.id});
//                     return res.status(200).json({message: "Directory deleted successfully"});
//                 } else {
//                     return res.status(404).json({message: "Directory not found for deletion"});
//                 }
//             } else {
//                 // filePath = path.join(config.get('filePath'), req.user.id, file.path, file.name);
//                 filePath = path.join(req.filePath, req.user.id, file.path, file.name);
//                 console.log(`Attempt to delete file: ${filePath}`);
//                 if (fs.existsSync(filePath)) {
//                     fs.unlinkSync(filePath);
//                     await File.deleteOne({_id: req.query.id});
//                     return res.status(200).json({message: "File deleted successfully"});
//                 } else {
//                     return res.status(404).json({message: "File not found for deletion"});
//                 }
//             }
//         } catch (e) {
//             console.error(`Error deleting file: ${e}`);
//             return res.status(500).json({message: "Error deleting file", error: e.toString()});
//         }
//     }




//     async searchFile(req, res) {
//         try {
//             const searchName = req.query.search
//             let files = await File.find({user: req.user.id})
//             files = files.filter(file => file.name.includes(searchName))
//             return res.json(files)
//         } catch (e) {
//             console.log(e)
//             return res.status(400).json({message: 'Search error'})
//         }
//     }

//     async renameFile(req, res) {
//         try {
//             const { id, newName } = req.body;
//             const file = await File.findOne({_id: id, user: req.user.id});
    
//             if (!file) {
//                 return res.status(404).json({ message: 'File not found' });
//             }
    
//             // const filePath = path.join(config.get('filePath'), req.user.id, file.path, file.name);
//             const filePath = path.join(req.filePath, req.user.id, file.path, file.name);
//             // const newPath = path.join(config.get('filePath'), req.user.id, file.path, newName);
//             const newPath = path.join(req.filePath, req.user.id, file.path, newName);
    
//             if (fs.existsSync(newPath)) {
//                 return res.status(400).json({ message: 'File with this name already exists' });
//             }
    
//             fs.renameSync(filePath, newPath);
//             file.name = newName;
//             await file.save();
//             return res.json(file);
//         } catch (e) {
//             console.log(e);
//             return res.status(500).json({ message: 'Error renaming file' });
//         }
//     }

//     async renameDir(req, res) {
//         try {
//             const { id, newName } = req.body;
//             const dir = await File.findOne({ _id: id, user: req.user.id });

//             if (!dir) {
//                 return res.status(404).json({ message: 'Директория не найдена' });
//             }

//             // const oldPath = path.join(config.get('filePath'), req.user.id, dir.path);
//             const oldPath = path.join(req.filePath, req.user.id, dir.path);
//             // const newPath = path.join(config.get('filePath'), req.user.id, path.dirname(dir.path), newName);
//             const newPath = path.join(req.filePath, req.user.id, path.dirname(dir.path), newName);

//             if (fs.existsSync(newPath)) {
//                 return res.status(400).json({ message: 'Имя уже существует' });
//             }

//             fs.renameSync(oldPath, newPath);

//             dir.path = path.join(path.dirname(dir.path), newName);
//             dir.name = newName;
//             await dir.save();

//             return res.json({ message: 'Директория переименована', dir });
//         } catch (e) {
//             console.log(e);
//             return res.status(500).json({ message: 'Ошибка переименования директории', error: e.toString() });
//         }
//     }








// } 

// module.exports = new FileController()


const fileService = require('../services/fileService');
const fs = require('fs');
const User = require('../models/User');
const File = require('../models/File');
const path = require('path');
const archiver = require('archiver');
// const Uuid = require('uuid');

class FileController {

    async createDir(req, res) {
        try {
            const { name, type, parent } = req.body;
            console.log(req.user, req.body);
            const file = new File({ name, type, parent, user: req.user.id });
            const parentFile = await File.findOne({ _id: parent });
            if (!parentFile) {
                file.path = name;
                await fileService.createDir(file);
            } else {
                file.path = path.join(parentFile.path, file.name);
                await fileService.createDir(file);
                parentFile.childs.push(file._id);
                await parentFile.save();
            }
            await file.save();
            return res.json(file);
        } catch (e) {
            console.log(e);
            return res.status(400).json(e);
        }
    }

    async getFiles(req, res) {
        try {
            const { sort } = req.query;
            let files;
            
            switch (sort) {
                case 'name':
                    files = await File.find({ user: req.user.id, parent: req.query.parent }).sort({ name: 1 });
                    break;
                case 'type':
                    files = await File.find({ user: req.user.id, parent: req.query.parent }).sort({ type: 1 });
                    break;
                case 'date':
                    files = await File.find({ user: req.user.id, parent: req.query.parent }).sort({ date: 1 });
                    break;
                default:
                    files = await File.find({ user: req.user.id, parent: req.query.parent });
                    break;
            }

            return res.json(files);
        } catch (e) {
            console.log(e);
            return res.status(500).json({ message: "Can not get files" });
        }
    }

    async uploadFile(req, res) {
        try {
            const { file } = req.files;
            const { parent } = req.body;
            const user = await User.findOne({ _id: req.user.id });
    
            if (!file) {
                return res.status(400).json({ message: 'Файл не был загружен' });
            }
    
            if (user.usedSpace + file.size > user.diskSpace) {
                return res.status(400).json({ message: 'Недостаточно места на диске' });
            }
    
            user.usedSpace += file.size;
    
            const parentFile = await File.findOne({ _id: parent });
    
            let version = 1;
            let fileName = file.name;
            const userFilePath = path.join(req.filePath, user._id.toString());
            const filePath = path.join(userFilePath, parentFile ? parentFile.path : '', fileName);
    
            while (fs.existsSync(filePath)) {
                const indexOfDot = fileName.lastIndexOf('.');
                const baseName = indexOfDot !== -1 ? fileName.slice(0, indexOfDot) : fileName;
                const extension = indexOfDot !== -1 ? fileName.slice(indexOfDot) : '';
                fileName = `${baseName}(${version})${extension}`;
                filePath = path.join(userFilePath, parentFile ? parentFile.path : '', fileName);
                version++;
            }
    
            file.mv(filePath);
    
            const fileType = fileName.split('.').pop();
    
            const dbFile = new File({
                name: fileName,
                type: fileType,
                size: file.size,
                path: parentFile ? parentFile.path : '',
                parent: parentFile ? parentFile._id : null,
                user: user._id
            });
    
            await dbFile.save();
            await user.save();
    
            return res.json(dbFile);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Ошибка загрузки" });
        }
    }

    async downloadFile(req, res) {
        const file = await File.findOne({ _id: req.query.id, user: req.user.id });
        
        if (file.type === 'dir') {
            const folderPath = path.join(req.filePath, req.user.id, file.path);
            console.log(folderPath);
            res.writeHead(200, {
                'Content-Type': 'application/zip',
                'Content-disposition': `attachment; filename=${file.name}.zip`
            });

            const zip = archiver('zip', { zlib: { level: 9 }});
            zip.pipe(res);

            async function addFolderToArchive(folderPath, archive, relativePath) {
                const items = fs.readdirSync(folderPath);
                for (const item of items) {
                    const itemPath = path.join(folderPath, item);
                    const stats = fs.statSync(itemPath);
                    if (stats.isDirectory()) {
                        await addFolderToArchive(itemPath, archive, path.join(relativePath, item)); 
                    } else {
                        archive.append(fs.createReadStream(itemPath), { name: path.join(relativePath, item) }); 
                    }
                }
            }

            await addFolderToArchive(folderPath, zip, ''); 
          
            zip.finalize(); // Завершает архивацию и отправляет архив в ответе
        } else {
            const filePath = path.join(req.filePath, req.user.id, file.path, file.name);
            res.download(filePath);
        }
    }

    async deleteFile(req, res) {
        try {
            const file = await File.findOne({_id: req.query.id, user: req.user.id});
            if (!file) {
                return res.status(404).json({message: 'File not found'});
            }
    
            let filePath;
            if (file.type === 'dir') {
                filePath = path.join(req.filePath, req.user.id, file.path);
                console.log(`Attempt to delete directory: ${filePath}`);
                if (fs.existsSync(filePath)) {
                    fileService.deleteDir(file);
                    await File.deleteOne({_id: req.query.id});
                    return res.status(200).json({message: "Directory deleted successfully"});
                } else {
                    return res.status(404).json({message: "Directory not found for deletion"});
                }
            } else {
                filePath = path.join(req.filePath, req.user.id, file.path, file.name);
                console.log(`Attempt to delete file: ${filePath}`);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    await File.deleteOne({_id: req.query.id});
                    return res.status(200).json({message: "File deleted successfully"});
                } else {
                    return res.status(404).json({message: "File not found for deletion"});
                }
            }
        } catch (e) {
            console.error(`Error deleting file: ${e}`);
            return res.status(500).json({message: "Error deleting file", error: e.toString()});
        }
    }

    async searchFile(req, res) {
        try {
            const searchName = req.query.search;
            let files = await File.find({user: req.user.id});
            files = files.filter(file => file.name.includes(searchName));
            return res.json(files);
        } catch (e) {
            console.log(e);
            return res.status(400).json({message: 'Search error'});
        }
    }

    async renameFile(req, res) {
        try {
            const { id, newName } = req.body;
            const file = await File.findOne({_id: id, user: req.user.id});
    
            if (!file) {
                return res.status(404).json({ message: 'File not found' });
            }
    
            const filePath = path.join(req.filePath, req.user.id, file.path, file.name);
            const newPath = path.join(req.filePath, req.user.id, file.path, newName);
    
            if (fs.existsSync(newPath)) {
                return res.status(400).json({ message: 'File with this name already exists' });
            }
    
            fs.renameSync(filePath, newPath);
            file.name = newName;
            await file.save();
            return res.json(file);
        } catch (e) {
            console.log(e);
            return res.status(500).json({ message: 'Error renaming file' });
        }
    }

    async renameDir(req, res) {
        try {
            const { id, newName } = req.body;
            const dir = await File.findOne({ _id: id, user: req.user.id });

            if (!dir) {
                return res.status(404).json({ message: 'Директория не найдена' });
            }

            const oldPath = path.join(req.filePath, req.user.id, dir.path);
            const newPath = path.join(req.filePath, req.user.id, path.dirname(dir.path), newName);

            if (fs.existsSync(newPath)) {
                return res.status(400).json({ message: 'Имя уже существует' });
            }

            fs.renameSync(oldPath, newPath );

            dir.path = path.join(path.dirname(dir.path), newName);
            dir.name = newName;
            await dir.save();

            return res.json({ message: 'Директория переименована', dir });
        } catch (e) {
            console.log(e);
            return res.status(500).json({ message: 'Ошибка переименования директории', error: e.toString() });
        }
    }
}

module.exports = new FileController();

