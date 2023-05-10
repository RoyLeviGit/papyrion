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
        { id: -2, ai: true, message: textFromGPT },
        { id: -1, ai: false, message: textFromGPT },
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
        if (!Cookies.get('access_token')) {
            return;
        }

        console.log(Cookies.get('access_token'))

        const newSocket = new WebSocket(`ws://${import.meta.env.VITE_API_URL}/chat`);//,  //{
            // extraHeaders: {
            //     'Authorization': `Bearer ${Cookies.get('access_token')}`
            // },
        //});
        newSocket.onmessage = (event: any) => {
            const data = JSON.parse(event.data);
            const type = data.type
            const message = data.message
            console.log(message)

            if (type == "new_token") {
                setChatMessages((prevMessages) => {
                    const updatedMessages = [...prevMessages];
                    if (updatedMessages.length > 0)
                      updatedMessages[updatedMessages.length - 1].message += message.token;
                    else
                      updatedMessages.push({ id: uuidv4(), ai: false, message: message.token });
        
                    if (message.delimiter) {
                        updatedMessages.push({ id: uuidv4(), ai: true, message: "" });

                        // Start a new message
                        updatedMessages.push({ id: uuidv4(), ai: false, message: "" });
                    }
            
                    return updatedMessages;
                });
    
            }
        }
        newSocket.onopen = () => {
            setSocket(newSocket);
        }
    
        return () => {
            newSocket.close();
        };
    }, []);

    useEffect(() => {
        if (selectedFile && status.status !== "questioning") {
          setStatus({
            status: "questioning",
            description: `Questioning file ${selectedFile}...`,
          });
            
          if (socket) {
            // // Send the question request
            console.log('Sending question request');
            socket.send(JSON.stringify({"type": "question_doc", "document_id": selectedFile}));
          }
        }
        return () => {};
      }, [selectedFile, socket]);

    return (
        <div className={styles.App}>
            <Dropzone text="📜" className={styles.dropzone} selectedFile={selectedFile} setSelectedFile={setSelectedFile} />
            <MultiChat status={status.description} chatMessages={chatMessages}/>
        </div>
    );
}

export default App;
