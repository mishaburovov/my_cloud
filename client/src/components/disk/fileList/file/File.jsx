import React, { useState } from 'react';
import './file.scss';
import sizeFormat from '../../../../utils/sizeFormat';
import dirLogo from '../../../../assets/img/dir.svg';
import fileLogo from '../../../../assets/img/file.svg';
import downloadImage from '../../../../assets/img/download.svg';
import renameImage from '../../../../assets/img/rename.svg';
import deleteImage from '../../../../assets/img/delete.svg';
import { useDispatch, useSelector } from "react-redux";
import { setCurrentDir } from '../../../../reducers/fileReducer';
import { downloadFile, deleteFile } from "../../../../action/file";
import RenamePopup from './RenamePopup';

const File = ({ file }) => {
  const [showRenamePopup, setShowRenamePopup] = useState(false);

  const openRenamePopup = () => setShowRenamePopup(true);
  const closeRenamePopup = () => setShowRenamePopup(false);

  const dispatch = useDispatch();
  const currentDir = useSelector(state => state.files.currentDir);

  function openDirHandler(file) {
    if (file.type === 'dir') {
      dispatch(setCurrentDir(file._id));
    }
  }

  function downloadClickHandler(e) {
    e.stopPropagation();
    downloadFile(file);
  }

  function deleteClickHandler(e) {
    e.stopPropagation();
    dispatch(deleteFile(file));
  }

  return (
    <div className='file' onClick={() => openDirHandler(file)}>
      <img src={file.type === 'dir' ? dirLogo : fileLogo} alt="" className="file__img" />
      <div className="file__name">{file.name}</div>
      <div className="file__date">{file.date.slice(0, 10)}</div>
      <div className="file__size">{sizeFormat(file.size)}</div>
      {file.type === 'dir' &&
        <img
          src={downloadImage}
          onClick={(e) => downloadClickHandler(e)}
          className="file__btn file__download"
          alt="Download"
        />
      }
      {file.type !== 'dir' &&
        <img
          src={downloadImage}
          onClick={(e) => downloadClickHandler(e)}
          className="file__btn file__download"
          alt="Download"
        />
      }
      <img
        src={renameImage}
        onClick={(e) => {
          e.stopPropagation();
          openRenamePopup();
        }}
        className="file__btn file__rename"
        alt="Rename"
      />
      <img
        src={deleteImage}
        onClick={(e) => deleteClickHandler(e)}
        className="file__btn file__delete"
        alt="Delete"
      />
      {showRenamePopup && <RenamePopup file={file} closePopup={closeRenamePopup} />}
    </div>
  );
};

export default File;