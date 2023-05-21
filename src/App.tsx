import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import styles from './App.module.scss';
import { MultiChat } from './components/multi-chat/multi-chat';
import Cookies from 'js-cookie';
import { ChatMessage } from './components/chat/chat'
import { v4 as uuidv4 } from 'uuid';
import { Analytics } from '@vercel/analytics/react';
import { getNewToken, refreshToken, sendSourceRequest, urlCompletion, urlQuestionDoc } from './api/api';
import Hero from './components/hero/hero';
import { StatusBar } from './components/status-bar/status-bar';

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

const message = `
**Welcome to our Math Chat!**

Here's an example of using code in JavaScript:

\`\`\`javascript
function square(number) {
  return number * number;
}

console.log(square(5)); // Output: 25
\`\`\`

Now let's explore some inline and new line KaTeX math equations:

Inline equation: $E = mc^2$

New line equation:
$$
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
$$

Feel free to ask any math-related questions or discuss your ideas. Enjoy the chat!
`;
const short_message = `Welcome to our Math Chat!

Here's an example of using code in JavaScript:
\`\`\`javascript
function square(number) {
  return number * number;
}

console.log(square(5)); // Output: 25asdkljfaskljdhfakjsldh25asdkljfaskljdhf25asdkljfaskljdhfakjsldhfkljasakjsldhfkljasfkljas
\`\`\`
Some more text: 25asdkljfaskljdhfakjsldh25asdkljfaskljdhf25asdkljfaskljdhfakjsldhfkljasakjsldhfkljasfkljas25asdkljfaskljdhfakjsldh25asdkljfaskljdhf25asdkljfaskljdhfakjsldhfkljasakjsldhfkljasfkljas
`;

console.log(message);


function App() {
    const [emptyTopHeight, setEmptyTopHeight] = useState<number>(0);
    const [emptyMidHeight, setEmptyMidHeight] = useState<number>(0);
    const [status, setStatus] = useState(idleStatus);
    const [dropzoneKey, setDropzoneKey] = useState<number>(0);
    const [selectedFile, setSelectedFile] = useState<string>("");    // Dropzone selected item
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        // {
        //     id: "-1",
        //     ai: false,
        //     message: message
        // },
        // {
        //     id: "-2",
        //     ai: true,
        //     message: message
        // },
        // {
        //     id: "-3",
        //     ai: false,
        //     message: message
        // }
    ]);
    const [fillAiMessages, setFillAiMessages] = useState<string[]>([])

    useEffect(() => {
        const newTopHeight = () => {
            const newEmptyTopHeight = Math.min(Math.max((window.innerWidth - 1200) / 4, 0), 160);
            const heroElement = document.querySelector('.hero');
            setEmptyMidHeight(heroElement ? window.innerHeight - newEmptyTopHeight - heroElement.clientHeight + 50 : 0); 
            return newEmptyTopHeight;
        }
        setEmptyTopHeight(newTopHeight());

        const handleResize = () => {
            setEmptyTopHeight(newTopHeight());
        };
    
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
      }, []);

    const onNewToken = () => {
        setStatus(idleStatus);
        setDropzoneKey((prevKey) => prevKey + 1);
    };

    useEffect(() => {
        if (status.status !== errorStatus('').status) {
            return;
        }

        getNewToken(() => {
            onNewToken()
        }, (error) => {
            setStatus({
                status: "fatalError",
                description: `Error connecting to server: ${error}. Try deleting cookies and refreshing page!`,        
            });    
        });
    }, [status.status]);

    useEffect(() => {
        if (Cookies.get('refresh_token')) {
            refreshToken(() => {
                onNewToken();
            }, (error) => {
                setStatus(errorStatus(error));
            });
        }
         else {
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

        const url = urlCompletion;

        sendSourceRequest(url, payload, handleCompletionMessage, () => {

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
    
        const url = urlQuestionDoc;
        const body = {
            document_id: selectedFile
        };

        setChatMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];

            const initialMessageId = uuidv4();
            updatedMessages.push({ id: initialMessageId, ai: false, message: "" });

            sendSourceRequest(url, body, handleQuestionMessage, () => {
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
            <div style={{minHeight: emptyTopHeight}}/>
            <Hero/>
            <div style={{minHeight: emptyMidHeight}}/>
            <MultiChat chatMessages={chatMessages} setChatMessages={setChatMessages} setFillAiMessages={setFillAiMessages} selectedFile={selectedFile} setSelectedFile={setSelectedFile} setStatus={setStatus} dropzoneKey={dropzoneKey}/>
            <StatusBar status={status.description} />
            <Analytics />
        </div>
    );
}

export default App;
