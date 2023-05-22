import { Dispatch, SetStateAction, useState } from 'react';
import classNames from 'classnames';
import styles from './chat-input.module.scss';
import { v4 as uuidv4 } from 'uuid';
import TextareaAutosize from 'react-textarea-autosize';

import { ChatMessage } from '../chat/chat';

export interface ChatInputProps {
    className?: string;
    setChatMessages: Dispatch<SetStateAction<ChatMessage[]>>;
    setFillAiMessages: Dispatch<SetStateAction<string[]>>;
    setDropzoneDisplayed: Dispatch<SetStateAction<boolean>>;
}

export const ChatInput = ({
    className,
    setChatMessages,
    setFillAiMessages,
    setDropzoneDisplayed,
}: ChatInputProps) => {
    const [message, setMessage] = useState('');

    const handleMessageChange = (event: any) => {
        setMessage(event.target.value);
    };

    const handleSendMessage = () => {
        // Perform your logic to send the message
        setChatMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            const newMessageId = uuidv4();
            updatedMessages.push({ id: newMessageId, ai: false, message: message });

            const aiMessageHistory = [newMessageId];
            const aiResponseId = uuidv4();
            updatedMessages.push({
                id: aiResponseId,
                ai: true,
                message: '',
                history: aiMessageHistory,
            });
            setFillAiMessages((prevFillMessages) => {
                return [...prevFillMessages, aiResponseId];
            });

            return updatedMessages;
        });

        // Clear the input field
        setMessage('');
    };

    const handleKeyDown = (event: any) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className={classNames(styles.root, className)}>
            <TextareaAutosize
                className={styles.inputarea}
                minRows={3}
                maxRows={5}
                value={message}
                onChange={handleMessageChange}
                onKeyDown={handleKeyDown}
                placeholder={
                    'Enter your message for answers from uploaded docs or click a document to generate questions! ✨'
                }
            ></TextareaAutosize>
            <div className={styles.ChatInputButtons}>
                <button
                    onClick={() => setDropzoneDisplayed((prevVal) => !prevVal)}
                    className={styles.uploadFileButton}
                />
                <button onClick={handleSendMessage} className={styles.sendMessageButton}/>
            </div>
        </div>
    );
};
