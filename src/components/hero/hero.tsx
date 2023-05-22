// Hero component
import { Dispatch, SetStateAction } from 'react';
import { Dropzone } from '../dropzone/dropzone';
import styles from './hero.module.scss'; // You need to create this
import classNames from 'classnames';
import { DropzoneMockFile } from 'dropzone';

export interface HeroProps {
    dropzoneKey?: number;
    fetchedFiles: DropzoneMockFile[];
    setFetchedFiles: Dispatch<SetStateAction<DropzoneMockFile[]>>;
    setStatus: Dispatch<SetStateAction<{ status: string; description: string }>>;
    scrollScreen: () => void;
}

function Hero({ dropzoneKey, fetchedFiles, setFetchedFiles, setStatus, scrollScreen }: HeroProps) {
    return (
        <div className={classNames('hero', styles.hero)}>
            <div className={classNames(styles.titles, styles.titles)}>
                <div className={styles.mainTitle}>Welcome to Papyrion</div>
                <div className={styles.secondaryTitle}>Your Intelligent Content Companion</div>
                <p className={styles.description}>
                    Upload your files in a blink, ask any questions, and let our intelligent system
                    handle your document-related tasks
                </p>
            </div>
            <Dropzone
                    className={styles.dropzoneWide}
                    key={dropzoneKey}
                    setStatus={setStatus}
                    fetchedFiles={fetchedFiles}
                    setFetchedFiles={setFetchedFiles}
                    scrollScreen={scrollScreen}
            />
        </div>
    );
}

export default Hero;
