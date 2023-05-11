import { useEffect, useState } from 'react';
import classNames from 'classnames';
import styles from './App.module.scss';
import { Dropzone } from './components/dropzone/dropzone';
import { MultiChat } from './components/multi-chat/multi-chat';
import Cookies from 'js-cookie';
import { ChatMessage } from './components/chat/chat'
import { v4 as uuidv4 } from 'uuid';
import { sendRequest } from './api/api';

function App() {
    const [status, setStatus] = useState({
        status: 'idle',
        description: 'Ready to chat! Please upload files and let\'s begin!'
    });

    // Dropzone selected item
    const [selectedFile, setSelectedFile] = useState<string>("");
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [fillAiMessages, setFillAiMessages] = useState<string[]>([])

    useEffect(() => {
        // Handle token refresh
        const getNewToken = () => {
            Cookies.remove('access_token');
            console.log('Getting new token');
            fetch(`http://${import.meta.env.VITE_API_URL}/auth`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                Cookies.set('access_token', data.access_token);
                window.location.reload();
            })
            .catch(error => {
                console.error('Error fetching access_token:', error);
            });    
        }
        if (Cookies.get('access_token')) {
            console.log(`Got access_token ${Cookies.get('access_token')}`);
            // fetch(`http://${import.meta.env.VITE_API_URL}/refresh`, {
            //     method: 'POST',
            //     headers: {
            //     'Authorization': `Bearer ${Cookies.get('access_token')}`
            //     }
            // })
            // .then(response => {
            //     if (response.status === 200) {
            //         return;
            //     }
            // })
            // .catch(error => {
            //     console.error('An error occurred while checking the token:', error);
            //     getNewToken()
            // })
        } else {
            getNewToken()
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

        const url = `http://${import.meta.env.VITE_API_URL}/completion`;

        sendRequest(url, payload, handleCompletionMessage, () => {

        }, messageId);
    }, [fillAiMessages]);

    useEffect(() => {
        if (selectedFile && status.status !== "questioning") {
            setStatus({
                status: "questioning",
                description: `Questioning file ${selectedFile}...`,
            });
        
            const url = `http://${import.meta.env.VITE_API_URL}/question_doc`;
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
                        status: "idle",
                        description: `Done questioning ${selectedFile}! Keep chating or question another file`,
                    });    
                }, initialMessageId);
    
                return updatedMessages;
            });
        }
    }, [selectedFile]);
    
    return (
        <div className={styles.App}>
            <Dropzone text="📜" className={styles.dropzone} selectedFile={selectedFile} setSelectedFile={setSelectedFile} />
            <MultiChat status={status.description} chatMessages={chatMessages} setChatMessages={setChatMessages} setFillAiMessages={setFillAiMessages}/>
        </div>
    );
}

export default App;
