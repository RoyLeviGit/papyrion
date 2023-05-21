// Hero component
import React from 'react';
import { Dropzone } from '../dropzone/dropzone';
import styles from './hero.module.scss';  // You need to create this
import classNames from 'classnames';

function Hero({  }) {
    return (
        <div className={classNames("hero", styles.hero)}>
            <div className={styles.titles}>
                <div className={styles.mainTitle}>Welcome to Papyrion</div> 
                <div className={styles.secondaryTitle}>
                    Your Intelligent Content Companion 
                </div> 
                <p className={styles.description}>
                    Upload your files in a blink, ask any questions, and let our
                    intelligent system handle your document-related tasks
                </p>
            </div>
            <div className={classNames('dropzone', styles.dD)}>
                <p className={styles.dDText}>
                    Drag and drop your content here or click to upload
                </p>
            </div>
        </div>
    );
}

export default Hero;
