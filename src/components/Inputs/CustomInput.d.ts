import { FunctionComponent } from 'react';
import PropTypes, { InferProps } from 'prop-types';


export interface CustomInputRef {
    getInputValue: () => string,
    setWarnning: (boolean) => void,
}

export type CustomInputProps = {
    defaultValue: string | null;
    onChange: (string) => void;
};

type Props = InferProps<typeof CustomInputProps>

const CustomInput: FunctionComponent<Props>;

export default CustomInput;