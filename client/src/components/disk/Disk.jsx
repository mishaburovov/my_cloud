import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {useState, useEffect } from "react";
import {createDir, getFiles, uploadFile, goToPath, openDir} from "../../action/file";
import './disk.scss'
import FileList from "./fileList/FileList";
import Popup from "./Popup";
import Uploader from "./uploader/Uploader";


import {setCurrentDir,setPopupDisplay} from "../../reducers/fileReducer";
const Disk = () => {

    const dispatch = useDispatch()
    const currentDir = useSelector(state => state.files.currentDir)
    const loader = useSelector(state => state.app.loader)
    const [dirStack, setDirStack] = useState([]);
    const [dragEnter, setDragEnter] = useState(false)
    const [sort, setSort] = useState('type')



        

    useEffect(() => {
        dispatch(getFiles(currentDir, sort));
        
        setDirStack(prevStack => {
            if( prevStack.length == 1 && prevStack[0] === null && currentDir === null){
                return prevStack
            }
            return [...prevStack, currentDir] 
        });
        
    }, [currentDir, sort]);

     function showPopupHandler() {
        dispatch(setPopupDisplay('flex'))
        const fileInput = document.getElementById('disk__upload-input');
        if (fileInput) {
            fileInput.value = '';
        }
        
    }

    function goBackHandler() {
        if (dirStack.length > 1) {
            const prevDir = dirStack[dirStack.length - 2];
            setDirStack(prevStack => prevStack.slice(0, prevStack.length - 2));
            dispatch(setCurrentDir(prevDir));
        }
    }

    function fileUploadHandler(event) {
        const files = [...event.target.files]
        files.forEach(file => dispatch(uploadFile(file, currentDir)))
    }

    function dragEnterHandler(event) {
        event.preventDefault()
        event.stopPropagation()
        setDragEnter(true)
    }

    function dragLeaveHandler(event) {
        event.preventDefault()
        event.stopPropagation()
        setDragEnter(false)
    }

    function dropHandler(event) {
        event.preventDefault()
        event.stopPropagation()
        let files = [...event.dataTransfer.files]
        files.forEach(file => dispatch(uploadFile(file, currentDir)))
        setDragEnter(false)
    }

    if(loader) {
        return (
            <div className="loader-container">
                <div className="loader"></div>
            </div>
        )
    }



    return ( !dragEnter ?
        <div className="disk" onDragEnter={dragEnterHandler} onDragLeave={dragLeaveHandler} onDragOver={dragEnterHandler}>
            <div className="disk__btns">
                <button className="disk__back" onClick={goBackHandler}>
                    Назад
                </button>
                <button className="disk__create" onClick={showPopupHandler}>
                    Создать папку
                </button>
                <div className="disk__upload">
                        <label htmlFor="disk__upload-input" className="disk__upload-label">Загрузить файл</label>
                        <input multiple={true} onChange={(event)=> fileUploadHandler(event)} type="file" id="disk__upload-input" className="disk__upload-input"/>
                    </div>
                    <select value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className='disk__select'>
                        <option value="name">Имя</option>
                        <option value="type">Тип</option>
                        <option value="date">Дата</option>
                    </select>

            </div>
            <FileList />
            <Popup />
            <Uploader/>

        </div>
        :
        <div className="drop-area" onDrop={dropHandler} onDragEnter={dragEnterHandler} onDragLeave={dragLeaveHandler} onDragOver={dragEnterHandler}>
            Перетащите файлы сюда
        </div>
    );
};

export default Disk;
