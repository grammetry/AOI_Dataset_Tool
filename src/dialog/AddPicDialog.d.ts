import { FunctionComponent } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { ProjectDataType } from '../page/type';

export interface AddPicDialogRef {
    SetOpen: () => void,
}

export type AddPicDialogProps = {
};
 
type APProps = InferProps<typeof AddPicDialogProps>


const AddPicDialog: FunctionComponent<APProps>;
 
export default AddPicDialog;