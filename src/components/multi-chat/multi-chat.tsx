import { Dispatch, SetStateAction, useRef, useState } from 'react';
import classNames from 'classnames';
import styles from './multi-chat.module.scss';
import { Chat, ChatMessage } from '../chat/chat';
import { Dropzone } from '../dropzone/dropzone';
import Cookies from 'js-cookie';
import { urlDeleteFiles } from '../../api/api';
import { errorStatus } from '../../App';
import { DropzoneMockFile } from 'dropzone';

export interface MultiChatProps {
    className?: string;
    dropzoneKey?: number;
    fetchedFiles: DropzoneMockFile[];
    setFetchedFiles: Dispatch<SetStateAction<DropzoneMockFile[]>>;
    setStatus: Dispatch<SetStateAction<{ status: string; description: string }>>;
    selectedFile?: string;
    setSelectedFile?: (value: string) => void;
    chatMessages?: ChatMessage[];
    setChatMessages: Dispatch<SetStateAction<ChatMessage[]>>;
    setFillAiMessages: Dispatch<SetStateAction<string[]>>;
};

export const MultiChat = ({
    className,
    dropzoneKey,
    fetchedFiles,
    setFetchedFiles,
    setStatus,
    selectedFile,
    setSelectedFile,
    chatMessages,
    setChatMessages,
    setFillAiMessages,
}: MultiChatProps) => {
    const [dropzoneDisplayed, setDropzoneDisplayed] = useState(false);
    const displayedDropzoneRef = useRef<HTMLDivElement>(null);


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
                setFetchedFiles?.([]);
            }
        })
        .catch((error) => {
            setStatus(errorStatus(error));
        });
    };


    const onDisplayedDropzoneClick = (event: React.MouseEvent) => {
        if (event.target !== displayedDropzoneRef.current) {
            return;
        }
        setDropzoneDisplayed?.(false);
        console.log(dropzoneDisplayed)
    };

    return (
        <div className={classNames(styles.root, className)}>
            <div ref={displayedDropzoneRef} className={classNames(styles.dropzoneArea, !dropzoneDisplayed && styles.hidden)} onClick={onDisplayedDropzoneClick}>
                <button className={styles.resetButton} onClick={onResetClick}>Reset</button>
                <Dropzone
                    className={styles.dropzoneLong}
                    fetchedFiles={fetchedFiles}
                    setFetchedFiles={setFetchedFiles}
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                    setStatus={setStatus}
                    key={dropzoneKey}
                />
            </div>
            <Chat
                chatMessages={chatMessages}
                setChatMessages={setChatMessages}
                setFillAiMessages={setFillAiMessages}
                setDropzoneDisplayed={setDropzoneDisplayed}
            />
        </div>
    );
};
