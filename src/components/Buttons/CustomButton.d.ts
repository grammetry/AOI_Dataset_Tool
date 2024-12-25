import { FunctionComponent } from 'react';
import PropTypes, { InferProps } from 'prop-types';

import { ProjectDataType } from '../page/type';

export interface TrainingDialogRef {
    SetOpen: () => void,
}

export type CustomButtonProps = {
    name: string;
    text: string;
    onClick: () => void;
};

type CBProps = InferProps<typeof CustomButtonProps>


const CustomButton: FunctionComponent<CBProps>;

export default CustomButton;