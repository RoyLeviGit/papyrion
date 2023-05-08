import { useEffect, useState } from 'react';
import classNames from 'classnames';
import styles from './App.module.scss';
import { Dropzone } from './components/dropzone/dropzone';
import { MultiChat } from './components/multi-chat/multi-chat';
import Cookies from 'js-cookie';
import { fetchEventSource, EventStreamContentType } from '@microsoft/fetch-event-source';
import { Socket, io } from "socket.io-client";


function App() {
    const [socket, setSocket] = useState<Socket>();
    const [status, setStatus] = useState({
        status: 'initial',
        description: 'Ready to chat! Please upload files and let\'s begin!'
    });

    // Dropzone selected item
    const [selectedFile, setSelectedFile] = useState<string>('');

    useEffect(() => {
        // Handle token refresh
        const getNewToken = () => {
            Cookies.remove('token');
            console.log('Getting new token');
            fetch(`${import.meta.env.VITE_API_URL}api/login`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                Cookies.set('token', data.token);
            })
            .catch(error => {
                console.error('Error fetching token:', error);
            });    
        }
        if (Cookies.get('token')) {
            fetch(`${import.meta.env.VITE_API_URL}api/check-token`, {
                headers: {
                'Authorization': `Bearer ${Cookies.get('token')}`
                }
            })
            .then(response => {
                if (response.status === 200) {
                    return;
                }
                getNewToken()
            })
            .catch(error => {
                console.error('An error occurred while checking the token:', error);
                getNewToken()
            })
        } else {
            getNewToken()
        }
    }, []);

    useEffect(() => {
         const newSocket = io(`${import.meta.env.VITE_API_URL}`,  {
            extraHeaders: {
                'Authorization': `Bearer ${Cookies.get('token')}`
            },
        });
        setSocket(newSocket);
    
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
      
          // Add a listener for the "question_response" event
          const handleQuestionResponse = (data: any) => {
            console.log('Sending question request');
            console.log(data);
            const questions = data;
          };
      
          if (socket) {
            socket.on(`question_response_${selectedFile}`, handleQuestionResponse);
            // Send the question request
            console.log('Sending question request');
            socket.emit("api/question", {
                document_id:  selectedFile,
                token: Cookies.get('token'),
            });
          }
      
          return () => {
            if (socket) {
              socket.off(`question_response_${selectedFile}`, handleQuestionResponse);
            }
          };
        }
      }, [selectedFile, socket]);

    return (
        <div className={styles.App}>
            <Dropzone text="📜" className={styles.dropzone} selectedFile={selectedFile} setSelectedFile={setSelectedFile} />
            <MultiChat status={status.description} />
        </div>
    );
}

export default App;
