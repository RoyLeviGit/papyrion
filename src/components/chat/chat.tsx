import classNames from 'classnames';
import styles from './chat.module.scss';
import { ChatInput } from '../chat-input/chat-input';
import { FormattedText } from '../formatted-text/formatted-text';

export interface ChatMessage {
    ai: boolean;
    message: string;
}

export interface ChatProps {
    className?: string;
    chatMessages?: ChatMessage[];
}

export const Chat = ({ className, chatMessages }: ChatProps) => {
    // Add empty message if no messages
    if (!chatMessages) {
        chatMessages = [{ ai: true, message: 'sdfg' }, { ai: false, message: 'fdsv' }];
    }
    // String together chat messages
    const formattedChatMessages = chatMessages?.map(message => {
        return (
            <div className={classNames(styles.message, message.ai ? styles.ai : styles.user)}>
                <FormattedText text={message.message} />
            </div>
        );
    });
    


    return (
        <div className={classNames(styles.root, className)}>
            {formattedChatMessages}
            <ChatInput />
        </div>
    );
};
