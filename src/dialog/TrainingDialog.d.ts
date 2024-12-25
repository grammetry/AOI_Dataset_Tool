import { FunctionComponent } from 'react';
import PropTypes, { InferProps } from 'prop-types';

import { ProjectDataType } from '../page/type';

export interface TrainingDialogRef {
    SetOpen: () => void,
}

export type TrainingDialogProps = {
    currentProject: ProjectDataType;
    setPageKey: Dispatch<SetStateAction<PageKeyType>>;
    };
 
type TDProps = InferProps<typeof TrainingDialogProps>


const TrainingDialog: FunctionComponent<TDProps>;
 
export default TrainingDialog;