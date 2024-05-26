import axiosInstance from '../axios'
import {addFile, setFiles, deleteFileAction, updateFile} from "../reducers/fileReducer";
import {addUploadFile, changeUploadFile, showUploader} from "../reducers/uploadReducer";
import {hideLoader, showLoader} from "../reducers/appReducer";

export function getFiles(dirId, sort) {
    return async dispatch => {
        try {
            dispatch(showLoader())
            let url = `/files`

            if (dirId) {
                url = `/files?parent=${dirId}`
            }
            if (sort) {
                url = `/files?sort=${sort}`
            }
            if (dirId && sort) {
                url = `/files?parent=${dirId}&sort=${sort}`
            }
            const response = await axiosInstance.get(url, {
            
                headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}
            })
            dispatch(setFiles(response.data))
        } catch (e) {
            alert(e.response.data.message)
        } finally {
            dispatch(hideLoader())
        }
    }
}

export function createDir(dirId, name) {
    return async dispatch => {
        try {
            const response = await axiosInstance.post(`/files`,{
                name,
                parent: dirId,
                type: 'dir'
            }, {
                headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}
            })
            dispatch(addFile(response.data))
        } catch (e) {
            alert(e.response.data.message)
        }
    }
}


export const uploadFile = (file, dirId) => {
    return async dispatch => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (dirId) {
                formData.append('parent', dirId);
            }

            const uploadFile = { name: file.name, progress: 0, id: Date.now() };
            dispatch(showUploader());
            dispatch(addUploadFile(uploadFile));

            const response = await axiosInstance.post(`/files/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: progressEvent => {
                    const totalLength = progressEvent.total;
                    if (totalLength) {
                        const updatedProgress = Math.round((progressEvent.loaded * 100) / totalLength);
                        dispatch(changeUploadFile({ id: uploadFile.id, progress: updatedProgress }));
                    }
                }
            });

            dispatch(addFile(response.data));
        } catch (e) {
            alert(e.response.data.message);
        }
    }
}
////????????????????

export async function downloadFile(file) {
    try {
        const response = await axiosInstance.get(`/files/download`, {
            responseType: 'blob',
            params: {
                id: file._id
            }
        });

        if (response.status === 200) {
            const blob = new Blob([response.data], { type: response.data.type });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${file.name}${file.type === 'dir' ? '.zip' : ''}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
        }
    } catch (e) {
        alert(e.response?.data?.message || 'Ошибка при загрузке файла.');
    }
}

export function deleteFile(file) {
    return async dispatch => {
        try {
            const response = await axiosInstance.delete(`/files?id=${file._id}`,{
                headers:{
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            dispatch(deleteFileAction(file._id))
            alert(response.data.message)

        } catch (e) {
            alert(e?.response?.data?.message)
        }
    }
}

export function searchFiles(search) {
    return async dispatch => {
        try {
            const response = await axiosInstance.get(`/files/search?search=${search}`,{
                headers:{
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            dispatch(setFiles(response.data))
        } catch (e) {
            alert(e?.response?.data?.message)
        } finally {
            dispatch(hideLoader())
        }
    }
}


export const renameFile = (fileId, newName) => {
    return async dispatch => {
        try {
            const response = await axiosInstance.post(`/files/renameFile`, { id: fileId, newName }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            dispatch(updateFile(response.data));
        } catch (error) {
            alert('Ошибка при переименовании файла: ' + error.message);
            throw error;
        }
    };
};

///////////////////////////////////////////

export const renameDir = (dirId, newName) => {
    return async dispatch => {
        try {
            const response = await axiosInstance.post(`/files/renameDir`, { id: dirId, newName }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            dispatch(updateFile(response.data));
        } catch (error) {
            alert('Ошибка при переименовании директории: ' + error.message);
            throw error;
        }
    };
};

