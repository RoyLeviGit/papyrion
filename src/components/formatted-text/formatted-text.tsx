import classNames from 'classnames';
import styles from './formatted-text.module.scss';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs2015 as codeStyle } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const CodeBlock = ({ language, value }: any) => {
    const customStyle = {
        ...codeStyle,
        'hljs': {
          ...codeStyle['hljs'],
          'background': 'transparent',
        },
      };

    return (
    <div className="code-block">
        <SyntaxHighlighter language={language || 'javascript'} style={customStyle}>
            {value || ''}
        </SyntaxHighlighter>
    </div>
    );
};

export interface FormattedTextProps {
    className?: string;
    text?: string;
    ai?: boolean;
}

export const FormattedText = ({ className, text, ai }: FormattedTextProps) => {
    return (
        <div className={classNames(styles.root, className, ai ? styles.ai : styles.human)}>
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                children={text || ''}
                components={{
                    code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                            <CodeBlock
                                language={match[1]}
                                value={String(children).replace(/\n$/, '')}
                                {...props}
                            />
                        ) : (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    },
                }}
            />
        </div>
    );
};
