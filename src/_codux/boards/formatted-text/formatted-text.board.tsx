import { createBoard } from '@wixc3/react-board';
import { FormattedText } from '../../../components/formatted-text/formatted-text';

export default createBoard({
    name: 'FormattedText',
    Board: () => <FormattedText />
});
