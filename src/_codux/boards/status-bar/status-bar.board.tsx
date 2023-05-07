import { createBoard } from '@wixc3/react-board';
import { StatusBar } from '../../../components/status-bar/status-bar';

export default createBoard({
    name: 'StatusBar',
    Board: () => <StatusBar />
});
