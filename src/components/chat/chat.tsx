import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import classNames from 'classnames';
import styles from './chat.module.scss';
import { ChatInput } from '../chat-input/chat-input';
import { FormattedText } from '../formatted-text/formatted-text';

export interface ChatMessage {
    id: string;
    ai: boolean;
    message: string;
    history?: string[]
}

export interface ChatProps {
    className?: string;
    chatMessages?: ChatMessage[];
    setChatMessages: Dispatch<SetStateAction<ChatMessage[]>>;
    setFillAiMessages: Dispatch<SetStateAction<string[]>>;
    setDropzoneDisplayed: Dispatch<SetStateAction<boolean>>;
}

export const Chat = ({ className, chatMessages, setChatMessages, setFillAiMessages, setDropzoneDisplayed }: ChatProps) => {
    const chatRef = useRef<HTMLDivElement>(null);

    // String together chat messages
    const formattedChatMessages = chatMessages?.map((message) => {
        return (
            <FormattedText ai={message.ai} text={message.message} key={message.id}/>
        );
    });

    useEffect(() => {
        const { current } = chatRef;
        if (!current) {
            return;
        }

        const shouldScroll = current.scrollHeight - current.scrollTop <= current.clientHeight + 100;

        if (shouldScroll) {
            current.scrollTop = current.scrollHeight;
        }
    }, [chatMessages]);

    return (
        <div className={classNames(styles.root, className)}>
            <div ref={chatRef} className={styles.formatedTextArea}>{formattedChatMessages}</div>
            <ChatInput setChatMessages={setChatMessages} setFillAiMessages={setFillAiMessages} setDropzoneDisplayed={setDropzoneDisplayed}/>
        </div>
    );
};
