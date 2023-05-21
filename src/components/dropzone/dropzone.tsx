import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import Dz, { DropzoneFile, DropzoneMockFile } from 'dropzone';

import 'dropzone/dist/dropzone.css';
import logo from '../../assets/logo.png';
import { errorStatus } from '../../App'

import classNames from 'classnames';
import styles from './dropzone.module.scss';
import { urlDeleteFiles, urlListFiles, urlUploadFile } from '../../api/api';

export interface DropzoneProps {
    className?: string;
    displayed?: boolean;
    setDisplayed?: Dispatch<SetStateAction<boolean>>;
    text?: string;
    selectedFile?: string;
    setSelectedFile?: (value: string) => void;
    setStatus: Dispatch<SetStateAction<{ status: string; description: string; }>>;
}

export const Dropzone = ({ className, displayed, setDisplayed, text, selectedFile, setSelectedFile, setStatus }: DropzoneProps) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const dropzoneRef = useRef<HTMLDivElement>(null);

    const [fetchedFiles, setFetchedFiles] = useState<DropzoneMockFile[]>([]);

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

        // Dz.autoDiscover = false;
        const dropzone = new Dz(dropzoneRef.current, {
            url: urlUploadFile,
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
        
        fetch(urlDeleteFiles, {
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

    const onDisplayedDropzoneClick = (event: React.MouseEvent) => {
        if (event.target !== rootRef.current) {
            return;
        }
        setDisplayed?.(false);
        console.log(displayed)
    };

    return (
        <div ref={rootRef} className={classNames(styles.root, className, !displayed && styles.hidden)} onClick={onDisplayedDropzoneClick}>
            <button className={styles.resetButton} onClick={onResetClick}>Reset</button>
            <div ref={dropzoneRef} className={classNames('dropzone', styles.dD)}>
                <p className={styles.dDText}>
                    Drag and drop your content here or click to upload
                </p>
            </div>
        </div>
    );
};
