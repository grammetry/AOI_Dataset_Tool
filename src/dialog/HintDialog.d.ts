import { FunctionComponent } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { ProjectDataType } from '../page/type';

export interface HintDialogRef {
    SetOpen: () => void,
}

export type HintDialogProps = {
};
 
type HDProps = InferProps<typeof HintDialogProps>


const HintDialog: FunctionComponent<HDProps>;
 
export default HintDialog;