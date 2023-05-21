import { Dispatch, SetStateAction, useState } from 'react';
import classNames from 'classnames';
import styles from './multi-chat.module.scss';
import { Chat, ChatMessage } from '../chat/chat';
import { Dropzone } from '../dropzone/dropzone';

export interface MultiChatProps {
    className?: string;
    setStatus: Dispatch<SetStateAction<{ status: string; description: string }>>;
    dropzoneKey?: number;
    selectedFile?: string;
    setSelectedFile?: (value: string) => void;
    chatMessages?: ChatMessage[];
    setChatMessages: Dispatch<SetStateAction<ChatMessage[]>>;
    setFillAiMessages: Dispatch<SetStateAction<string[]>>;
}

export const MultiChat = ({
    className,
    dropzoneKey,
    setStatus,
    selectedFile,
    setSelectedFile,
    chatMessages,
    setChatMessages,
    setFillAiMessages,
}: MultiChatProps) => {
    const [dropzoneDisplayed, setDropzoneDisplayed] = useState(false); 

    return (
        <div className={classNames(styles.root, className)}>
            <Dropzone
                displayed={dropzoneDisplayed}
                setDisplayed={setDropzoneDisplayed}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                setStatus={setStatus}
                key={dropzoneKey}
            />
            <Chat
                chatMessages={chatMessages}
                setChatMessages={setChatMessages}
                setFillAiMessages={setFillAiMessages}
                setDropzoneDisplayed={setDropzoneDisplayed}
            />
        </div>
    );
};
