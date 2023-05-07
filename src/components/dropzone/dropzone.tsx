import { useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import Dz from 'dropzone';

import 'dropzone/dist/dropzone.css';

import classNames from 'classnames';
import styles from './dropzone.module.scss';

export interface DropzoneProps {
    className?: string;
    text?: string;
}

export const Dropzone = ({ className, text }: DropzoneProps) => {
    const dropzoneRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (dropzoneRef.current) {
            const dropzone = new Dz(dropzoneRef.current, {
                url: `${import.meta.env.VITE_API_URL}/upload`,
                dictDefaultMessage:
                    text || "Drag 'n' drop some files here, or click to select files",
                headers: {
                    Authorization: `Bearer ${Cookies.get('token')}`,
                },
            });

            return () => {
                dropzone.destroy();
            };
        }
    }, []);

    return <div ref={dropzoneRef} className={classNames(styles.root, className, 'dropzone')} />;
};
