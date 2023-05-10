import classNames from 'classnames';
import styles from './chat.module.scss';
import { ChatInput } from '../chat-input/chat-input';
import { FormattedText } from '../formatted-text/formatted-text';

export interface ChatMessage {
    id: string;
    ai: boolean;
    message: string;
}

export interface ChatProps {
    className?: string;
    chatMessages?: ChatMessage[];
}

export const Chat = ({ className, chatMessages }: ChatProps) => {
    // String together chat messages
    const formattedChatMessages = chatMessages?.map((message) => {
        return (
            <FormattedText className={classNames(styles.message, message.ai ? styles.ai : styles.human)} text={message.message} key={message.id}/>
        );
    });

    return (
        <div className={classNames(styles.root, className)}>
            <div className={styles['formated-text-area']}>{formattedChatMessages}</div>
            <ChatInput />
        </div>
    );
};
