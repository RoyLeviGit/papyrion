import classNames from 'classnames';
import styles from './multi-chat.module.scss';
import { Chat, ChatMessage } from '../chat/chat';
import { StatusBar } from '../status-bar/status-bar';



export interface MultiChatProps {
    className?: string;
    status?: string;
    chatMessages?: ChatMessage[];
}

export const MultiChat = ({ className, status, chatMessages }: MultiChatProps) => {
    return (
        <div className={classNames(styles.root, className)}>
            <StatusBar status={status} />
            <Chat chatMessages={chatMessages}/>
        </div>
    );
};
