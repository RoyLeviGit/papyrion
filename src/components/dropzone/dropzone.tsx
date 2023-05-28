import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import Dz, { DropzoneFile, DropzoneMockFile } from 'dropzone';

import 'dropzone/dist/dropzone.css';
import logo from '../../assets/logo.png';
import { errorStatus } from '../../App'

import classNames from 'classnames';
import styles from './dropzone.module.scss';
import { urlListFiles, urlUploadFile } from '../../api/api';

export interface DropzoneProps {
    className?: string;
    fetchedFiles: DropzoneMockFile[];
    setFetchedFiles: Dispatch<SetStateAction<DropzoneMockFile[]>>;
    selectedFile?: string;
    setSelectedFile?: (value: string) => void;
    setStatus: Dispatch<SetStateAction<{ status: string; description: string; }>>;
    scrollScreen?: () => void;
}

export const Dropzone = ({ 
    className,
    fetchedFiles,
    setFetchedFiles,
    selectedFile, 
    setSelectedFile,
    setStatus,
    scrollScreen,
}: DropzoneProps) => {
    const dropzoneRef = useRef<HTMLDivElement>(null);
    const [dropzone, setDropzone] = useState<Dropzone | undefined>(undefined);

    // Serverside fetch files
    useEffect(() => {
        if (!Cookies.get('access_token')) {
            return;
        }

        fetch(urlListFiles, {
            headers: {
                Authorization: `Bearer ${Cookies.get('access_token')}`,
            },
        })
        .then((response) => response.json())
        .then((data) => {
            var foundNewFile = false;
            for (let i = 0; i < data.length; i++) {
                try {
                    if (dropzone?.files.some(file => file.name === data[i].name)) {
                        // Already in dropzone, skip
                        continue;
                    }    
                } catch (error) {
                    console.error(error);
                }
                foundNewFile = true;
                break;
            }
            if (foundNewFile) {
                setFetchedFiles?.(data);
            }
        })
        .catch((error) => {
            setStatus(errorStatus(error));
        });
    }, []);

    // New Dropzone
    const newDropzone = () => {
        setDropzone((oldDropzone) => {
            if (oldDropzone) {
                oldDropzone.destroy();
            }
            if (!dropzoneRef.current || !Cookies.get('access_token')) {
                return undefined;
            }

            const dz = new Dz(dropzoneRef.current, {
                url: urlUploadFile,
                dictDefaultMessage: "",
                headers: {
                    Authorization: `Bearer ${Cookies.get('access_token')}`,
                },
                parallelUploads: 1,
            });
            dz.on('addedfile', (file) => {
                if (file.status === "added" || file.status === "error") {
                    // Only continue with server listed files
                    return;
                }
    
                file.previewElement.addEventListener('click', () => {
                    setSelectedFile?.(file.name);
                });
            });
            dz.on('addedfiles', (files) => {
                // Add to fetchedFiles
                for (let i = 0; i < files.length; i++) {
                    if (fetchedFiles.some(fetchFile => fetchFile.name === files[i].name)) {
                        return;
                    }
                }
                setFetchedFiles([...fetchedFiles, ...files]);
            });
            
            dz.on('success', (file, response: any) => {
                file.previewElement.addEventListener('click', () => {
                    // Setting to file name as saved by the server
                    setSelectedFile?.(response.document_id);
                });
                scrollScreen?.(); // TODO: scroll only when finished uploading all files
            });
            return dz
        });
    }

    // Dropzone initialization
    useEffect(() => {
        if (!dropzoneRef.current || !Cookies.get('access_token')) {
            return;
        }

        Dz.autoDiscover = false;
        newDropzone();

        return () => {
            dropzone?.destroy();
        };
    }, []);

    useEffect(() => {
        if (dropzone && fetchedFiles.length === 0) {
            dropzone.removeAllFiles(true);
        } else if (dropzone && fetchedFiles) {
            for (let i = 0; i < fetchedFiles.length; i++) {
                if (dropzone.files.some(file => file.name === fetchedFiles[i].name)) {
                    // Already in dropzone, skip
                    continue;
                }
                const mockFile = {
                    name: fetchedFiles[i].name,
                    size: fetchedFiles[i].size,
                    previewElement: fetchedFiles[i].previewElement || undefined, // TODO: transfer thumbnail between dropzones
                };
                dropzone.displayExistingFile(mockFile, logo);
                // @ts-ignore need this to fix dropzone behavior
                dropzone.files.push(mockFile);
            }
        } 
    }, [fetchedFiles]);

    return (
        <div ref={dropzoneRef} className={classNames('dropzone', styles.dropzone, className)}>
            <p className={classNames(styles.dropzoneText, fetchedFiles.length > 0 && styles.dropzoneTextHidden)}>
                Drag and drop your content here or click to upload
            </p>
        </div>
    );
};
