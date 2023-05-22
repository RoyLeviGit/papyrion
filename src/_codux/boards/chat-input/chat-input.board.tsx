import { createBoard } from '@wixc3/react-board';
import { ChatInput } from '../../../components/chat-input/chat-input';

export default createBoard({
    name: 'ChatInput',
    Board: () => <ChatInput />,
    environmentProps: {
        windowWidth: 1320,
        canvasWidth: 1243,
        canvasHeight: 134,
    },
});
