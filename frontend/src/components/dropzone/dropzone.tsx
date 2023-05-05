import React, { useEffect, useRef } from 'react';
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
                url: '/upload/post',
                dictDefaultMessage:
                    text || "Drag 'n' drop some files here, or click to select files",
            });

            return () => {
                dropzone.destroy();
            };
        }
    }, []);

    return <div ref={dropzoneRef} className={classNames(styles.root, className, 'dropzone')} />;
};
