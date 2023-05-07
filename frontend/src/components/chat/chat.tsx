import classNames from 'classnames';
import styles from './chat.module.scss';
import { ChatInput } from '../chat-input/chat-input';

export interface ChatProps {
    className?: string;
}

/**
 * This component was created using Codux's Default new component template.
 * To create custom component templates, see https://help.codux.com/kb/en/article/configuration-for-chats-and-templates
 */
export const Chat = ({ className }: ChatProps) => {
    return (
        <div className={classNames(styles.root, className)}>
            <textarea className={classNames(styles.textarea, styles.outputarea)} />
            <ChatInput />
        </div>
    );
};
