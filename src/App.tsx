import { useEffect, useState } from 'react';
import classNames from 'classnames';
import styles from './App.module.scss';
import { Dropzone } from './components/dropzone/dropzone';
import { MultiChat } from './components/multi-chat/multi-chat';
import Cookies from 'js-cookie';
import { ChatMessage } from './components/chat/chat'
import { v4 as uuidv4 } from 'uuid';
import { sendRequest } from './api/api';

export const idleStatus = {
    status: 'idle',
    description: 'Ready to chat! Please upload files and let\'s begin!'
};
export const errorStatus = (error: any) => {
    return {
        status: "error",
        description: `Error connecting to server: ${error}. Refreshing connection to server!`,
    }
};

function App() {
    const [status, setStatus] = useState(idleStatus);
    const [dropzoneKey, setDropzoneKey] = useState<number>(0);
    const [selectedFile, setSelectedFile] = useState<string>("");    // Dropzone selected item
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [fillAiMessages, setFillAiMessages] = useState<string[]>([])

    const getNewToken = () => {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        fetch(`${import.meta.env.VITE_API_URL}/auth`, {
            method: "POST"
        })
        .then(response => response.json())
        .then(data => {
            Cookies.set('access_token', data.access_token);
            Cookies.set('refresh_token', data.refresh_token);
            setStatus(idleStatus);
            setDropzoneKey((prevKey) => prevKey + 1)
        })
        .catch(error => {
            setStatus({
                status: "fatalError",
                description: `Error connecting to server: ${error}. Try deleting cookies and refreshing page!`,        
            });
        });
    };

    useEffect(() => {
        if (status.status !== errorStatus('').status) {
            return;
        }

        getNewToken();
    }, [status.status]);

    useEffect(() => {
        if (Cookies.get('refresh_token')) {
            console.log(`Got refresh_token ${Cookies.get('refresh_token')}`);
            fetch(`${import.meta.env.VITE_API_URL}/refresh`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${Cookies.get('refresh_token')}`
                }
            })
            .then(response => response.json())
            .then(data => {
                Cookies.set('access_token', data.access_token);
                Cookies.set('refresh_token', data.refresh_token);
                setStatus(idleStatus);
                setDropzoneKey((prevKey) => prevKey + 1);    
            })
            .catch((error) => {
                setStatus(errorStatus(error));
            });
        } else {
            setStatus(errorStatus("No token"));
        }
    }, []);

    const handleQuestionMessage = (data: any, messageId: string) => {
        const nextMessageId = data.delimiter ? uuidv4() : messageId;
        setChatMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            const messageIndex = prevMessages.findIndex((element) => element.id === messageId)
            updatedMessages[messageIndex].message += data.token;

            if (data.delimiter) {
                const aiMessageHistory = [updatedMessages[messageIndex].id]
                const fillMessageId = uuidv4();
                updatedMessages.splice(messageIndex + 1, 0, { id: fillMessageId, ai: true, message: "", history: aiMessageHistory });
                setFillAiMessages((prevFillMessages) => {
                    return [...prevFillMessages, fillMessageId]
                })

                // Start a new message
                updatedMessages.push({ id: nextMessageId, ai: false, message: "" });
            }
    
            return updatedMessages;
        });
        return nextMessageId;
    };
    
    const handleCompletionMessage = (data: any, messageId: string) => {
        setChatMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            updatedMessages[prevMessages.findIndex((element) => element.id === messageId)].message += data.token;  
            return updatedMessages;
        });
        return messageId;   
    };
    

    useEffect(() => {
        const messageId = fillAiMessages[0];
        if (!messageId) {
            return;
        }

        setFillAiMessages(prevFillMessages => prevFillMessages.filter(element => element !== messageId));

        const message = chatMessages.find(element => element.id === messageId);
        if (!message || message.history?.length !== 1) {
            return;
        }

        const lastHumanMessageId = message.history[message.history.length - 1];
        const prompt = {
            page_content: chatMessages.find(element => element.id === lastHumanMessageId)?.message
        };
        const payload = {
            prompt: prompt,
            chat_history: []
        };

        const url = `${import.meta.env.VITE_API_URL}/completion`;

        sendRequest(url, payload, handleCompletionMessage, () => {

        }, messageId);
    }, [fillAiMessages]);

    useEffect(() => {
        if (!selectedFile || status.status !== idleStatus.status) {
            return;
        }

        setStatus({
            status: "questioning",
            description: `Questioning file ${selectedFile}...`,
        });
    
        const url = `${import.meta.env.VITE_API_URL}/question_doc`;
        const body = {
            document_id: selectedFile
        };

        setChatMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];

            const initialMessageId = uuidv4();
            updatedMessages.push({ id: initialMessageId, ai: false, message: "" });

            sendRequest(url, body, handleQuestionMessage, () => {
                setSelectedFile("")
                setStatus({
                    status: idleStatus.status,
                    description: `Done questioning ${selectedFile}! Keep chating or question another file`,
                });  
            }, initialMessageId);

            return updatedMessages;
        });
    }, [selectedFile]);
    
    return (
        <div className={styles.App}>
            <Dropzone text="📜" className={styles.dropzone} selectedFile={selectedFile} setSelectedFile={setSelectedFile} setStatus={setStatus} key={dropzoneKey} />
            <MultiChat status={status.description} chatMessages={chatMessages} setChatMessages={setChatMessages} setFillAiMessages={setFillAiMessages}/>
        </div>
    );
}

export default App;
