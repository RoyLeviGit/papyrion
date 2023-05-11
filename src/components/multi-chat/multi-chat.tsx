import { Dispatch, SetStateAction } from 'react';
import classNames from 'classnames';
import styles from './multi-chat.module.scss';
import { Chat, ChatMessage } from '../chat/chat';
import { StatusBar } from '../status-bar/status-bar';

export interface MultiChatProps {
    className?: string;
    status?: string;
    chatMessages?: ChatMessage[];
    setChatMessages: Dispatch<SetStateAction<ChatMessage[]>>;
    sefFillAiMessages: Dispatch<SetStateAction<string[]>>;
}

export const MultiChat = ({ className, status, chatMessages, setChatMessages, sefFillAiMessages }: MultiChatProps) => {
    return (
        <div className={classNames(styles.root, className)}>
            <StatusBar status={status} />
            <Chat chatMessages={chatMessages} setChatMessages={setChatMessages} sefFillAiMessages={sefFillAiMessages}/>
        </div>
    );
};
