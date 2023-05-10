import { useEffect, useState } from 'react';
import classNames from 'classnames';
import styles from './App.module.scss';
import { Dropzone } from './components/dropzone/dropzone';
import { MultiChat } from './components/multi-chat/multi-chat';
import Cookies from 'js-cookie';
import { ChatMessage } from './components/chat/chat'
import { v4 as uuidv4 } from 'uuid';

var textFromGPT = `
## This is a Markdown heading

This is a paragraph with some *italic* and **bold** text.

Here's some inline math: $\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$

Here's a code snippet:

\`\`\`javascript
function add(a, b) {
  return a + b;
}
\`\`\`
  `;

function App() {
    const [socket, setSocket] = useState<WebSocket>();
    const [status, setStatus] = useState({
        status: 'initial',
        description: 'Ready to chat! Please upload files and let\'s begin!'
    });

    // Dropzone selected item
    const [selectedFile, setSelectedFile] = useState<string>('');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { id: "-2", ai: true, message: textFromGPT },
        { id: "-1", ai: false, message: textFromGPT },
    ]);

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

    useEffect(() => {
        if (selectedFile && status.status !== "questioning") {
            setStatus({
                status: "questioning",
                description: `Questioning file ${selectedFile}...`,
            });

            console.log('Sending question request');
            fetch(`http://${import.meta.env.VITE_API_URL}/question_doc`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    document_id: selectedFile
                })
            }).then(response => {
                console.log(response);
                if (response.body) {
                    const reader = response.body.getReader()
                    console.log(reader); 
                    const decoder = new TextDecoder('utf-8');
                    const readData = async () => {
                        try {
                          while (true) {
                            const { done, value } = await reader.read();
                            if (done) {
                              break;
                            }
                            // process the data
                            const decodedValue = decoder.decode(value)
                            console.log(decodedValue);
                            // Check if the chunks start with "data: " and remove it if necessary
                            const dataPrefix = 'data: ';
                            const jsonValue = decodedValue.startsWith(dataPrefix) ? decodedValue.slice(dataPrefix.length) : decodedValue;
                            try {
                                const json = JSON.parse(jsonValue)
                                console.log(json)   
                                const data = json.data;

                                setChatMessages((prevMessages) => {
                                    const updatedMessages = [...prevMessages];
                                    if (updatedMessages.length > 0)
                                      updatedMessages[updatedMessages.length - 1].message += data.token;
                                    else
                                      updatedMessages.push({ id: uuidv4(), ai: false, message: data.token });
                        
                                    if (data.delimiter) {
                                        updatedMessages.push({ id: uuidv4(), ai: true, message: "" });
                
                                        // Start a new message
                                        updatedMessages.push({ id: uuidv4(), ai: false, message: "" });
                                    }
                            
                                    return updatedMessages;
                                });     
                            } catch(error) {
                                console.error(`Error parsing data: ${error}`);
                                continue
                            }
                          }
                        } catch (error) {
                          console.error(`Error reading data: ${error}`);
                        } finally {
                          reader.releaseLock();
                        }    
                    };
                    readData()
                }     
            }).catch((e) => {
                console.log(e);
            })
        }
      }, [selectedFile]);

    return (
        <div className={styles.App}>
            <Dropzone text="📜" className={styles.dropzone} selectedFile={selectedFile} setSelectedFile={setSelectedFile} />
            <MultiChat status={status.description} chatMessages={chatMessages}/>
        </div>
    );
}

export default App;
