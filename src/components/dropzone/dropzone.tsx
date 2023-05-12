import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import Dz, { DropzoneFile, DropzoneMockFile } from 'dropzone';

import 'dropzone/dist/dropzone.css';
import logo from '../../assets/logo.png';
import { errorStatus } from '../../App'

import classNames from 'classnames';
import styles from './dropzone.module.scss';

export interface DropzoneProps {
    className?: string;
    text?: string;
    selectedFile?: string;
    setSelectedFile?: (value: string) => void;
    setStatus: Dispatch<SetStateAction<{ status: string; description: string; }>>;
}

export const Dropzone = ({ className, text, selectedFile, setSelectedFile, setStatus }: DropzoneProps) => {
    const dropzoneRef = useRef<HTMLDivElement>(null);

    const [fetchedFiles, setFetchedFiles] = useState<DropzoneMockFile[]>([]);

    // Serverside fetch files
    useEffect(() => {
        if (!Cookies.get('access_token')) {
            return;
        }

        fetch(`${import.meta.env.VITE_API_URL}/list-files`, {
            headers: {
                Authorization: `Bearer ${Cookies.get('access_token')}`,
            },
        })
        .then((response) => response.json())
        .then((data) => {
            setFetchedFiles(data);
        })
        .catch((error) => {
            setStatus(errorStatus(error));
        });
    }, []);

    // Dropzone initialization
    useEffect(() => {
        if (!dropzoneRef.current || !Cookies.get('access_token')) {
            return;
        }

        Dz.autoDiscover = false;
        const dropzone = new Dz(dropzoneRef.current, {
            url: `${import.meta.env.VITE_API_URL}/upload`,
            dictDefaultMessage:
                text || "Drag 'n' drop some files here, or click to select files",
            headers: {
                Authorization: `Bearer ${Cookies.get('access_token')}`,
            },
            parallelUploads: 1,
        });
        dropzone.on('addedfile', (file) => {
            if (file.status === "added" || file.status === "error") {
                // Only continue with server listed files
                return;
            }

            file.previewElement.addEventListener('click', () => {
                setSelectedFile?.(file.name);
            });
        });
        dropzone.on('success', (file, response: any) => {
            file.previewElement.addEventListener('click', () => {
                // Setting to file name as saved by the server
                setSelectedFile?.(response.document_id);
            });
        });

        if (fetchedFiles) {
            for (let i = 0; i < fetchedFiles.length; i++) {
                const mockFile = {
                    name: fetchedFiles[i].name,
                    size: fetchedFiles[i].size,
                };
                // @ts-ignore need this to fix dropzone behavior
                dropzone.files.push(mockFile);
                dropzone.displayExistingFile(mockFile, logo);
            }
        }

        return () => {
            dropzone?.destroy();
        };
    }, [fetchedFiles]);

    const onResetClick = () => {
        if (!Cookies.get('access_token')) {
            return;
        }
        
        fetch(`${import.meta.env.VITE_API_URL}/delete-files`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${Cookies.get('access_token')}`,
            },
        })
        .then((response) => {
            if (response.status === 200) {
                setFetchedFiles([]);
            }
        })
        .catch((error) => {
            setStatus(errorStatus(error));
        });
    };

    return (
        <div className={classNames(styles.root, className)}>
            <button onClick={onResetClick}>Reset</button>
            <div ref={dropzoneRef} className={classNames('dropzone', styles.dropzone)} />
        </div>
    );
};
