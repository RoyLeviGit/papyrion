import classNames from 'classnames';
import styles from './multi-chat.module.scss';
import { Chat } from '../chat/chat';
import { StatusBar } from '../status-bar/status-bar';

export interface MultiChatProps {
    className?: string;
    status?: string;
}

export const MultiChat = ({ className, status }: MultiChatProps) => {
    return (
        <div className={classNames(styles.root, className)}>
            <StatusBar status={status} />
            <Chat />
        </div>
    );
};
