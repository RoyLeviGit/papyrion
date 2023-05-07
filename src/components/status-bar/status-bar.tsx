import classNames from 'classnames';
import styles from './status-bar.module.scss';

export interface StatusBarProps {
    className?: string;
}

/**
 * This component was created using Codux's Default new component template.
 * To create custom component templates, see https://help.codux.com/kb/en/article/configuration-for-status-bars-and-templates
 */
export const StatusBar = ({ className }: StatusBarProps) => {
    return (
        <div className={classNames(styles.root, className)}>
            StatusBar
            <a href="https://www.buymeacoffee.com/papyrion" target={"_blank"}>
                Buy me a coffee ☕️
            </a>
        </div>
    );
};
