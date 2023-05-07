import { createBoard } from '@wixc3/react-board';
import { Dropzone } from '../../../components/dropzone/dropzone';

export default createBoard({
    name: 'Dropzone',
    Board: () => <Dropzone className="dropzone" />,
    environmentProps: {},
});
