import React from 'react';
import './fileList.scss'
import {useSelector} from "react-redux";
import File from "./file/File";

const FileList = () => {

    const files = useSelector(state => state.files.files).map(file =><File key={file._id} file={file}/>)

    if (files.length === 0) {
        return (
            <div className='notfindfile'>Файлы не найдены</div>
        )
    }

    return (
        <div className='filelist'>
            <div className="filelist__header">
                <div className="filelist__name">Название</div>
                <div className="filelist__date">Дата</div>
                <div className="filelist__size">Размер</div>
            </div>

            <div className="filelist__body">
                <div className="filelist__wrapper">
                    {files}
                </div>
            </div>
        </div>
    );
};

export default FileList;
