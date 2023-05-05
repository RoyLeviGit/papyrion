import { createBoard } from '@wixc3/react-board';
import { MultiChat } from '../../../components/multi-chat/multi-chat';

export default createBoard({
    name: 'MultiChat',
    Board: () => <MultiChat />
});
