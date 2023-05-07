import classNames from 'classnames';
import styles from './App.module.scss';
import { Dropzone } from './components/dropzone/dropzone';
import { MultiChat } from './components/multi-chat/multi-chat';
import Cookies from 'js-cookie';

function App() {
    fetch(`${import.meta.env.VITE_API_URL}/login`)
    .then(response => response.json())
    .then(data => {
        const token = data.token;
        Cookies.set('token', token);
    })
    .catch(error => {
           console.error('Error fetching token:', error);
        });

    return (
        <div className={styles.App}>
            <Dropzone text="📜" className={styles.dropzone} />
            <MultiChat />
        </div>
    );
}

export default App;
