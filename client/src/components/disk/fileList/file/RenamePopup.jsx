import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { renameFile, renameDir } from '../../../../action/file';

const RenamePopup = ({ file, closePopup }) => {
    const [newName, setNewName] = useState(file.name);
    const dispatch = useDispatch();


    const handleRename = (e) => {
        e.stopPropagation();
        if (file.type === 'dir') {
            dispatch(renameDir(file._id, newName));
        } else {
            dispatch(renameFile(file._id, newName));
        }
        closePopup();
    };

    return (
        <div className='popup'>
            <div className='popup__content' onClick={e => e.stopPropagation()}>
                <div className='popup__header'>
                <div className="popup__title">Переименовать</div>
                    <button className="popup__close" onClick={closePopup}>X</button>
                </div>
                <input
                    type='text'
                    value={newName}
                    onChange={(e) => {
                        e.stopPropagation();
                        setNewName(e.target.value);
                    }}
                />
                <button className='popup__create' onClick={handleRename}>
                    Переименовать
                </button>
            </div>
        </div>
    );
};

export default RenamePopup;

