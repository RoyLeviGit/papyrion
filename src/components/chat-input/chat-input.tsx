import classNames from 'classnames';
import styles from './chat-input.module.scss';

export interface ChatInputProps {
    className?: string;
    text?: string;
}

export const ChatInput = ({ className, text }: ChatInputProps) => {
    return (
        <div className={classNames(styles.root, className)}>
            <textarea className={styles.inputarea} value={text} placeholder={"Enter your message for answers from uploaded docs or click a document to generate questions! ✨"}></textarea>
            <button>✅</button>
        </div>
    );
};
