import { useState } from 'react';
import classNames from 'classnames';
import { ReactComponent as ReactLogo } from './assets/react.svg';
import { ReactComponent as ViteLogo } from './assets/vite.svg';
import { ReactComponent as TypescriptLogo } from './assets/typescript.svg';
import { ReactComponent as ScssLogo } from './assets/scss.svg';
import styles from './App.module.scss';
import { Dropzone } from './components/dropzone/dropzone';
import { MultiChat } from './components/multi-chat/multi-chat';

function App() {
    const [count, setCount] = useState(0);

    return (
        <div className={styles.App}>
            <Dropzone text="📜" className={styles.dropzone} />
            <MultiChat />
        </div>
    );
}

export default App;
