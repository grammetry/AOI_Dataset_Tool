import { FunctionComponent } from 'react';
import PropTypes, { InferProps } from 'prop-types';

import { ProjectDataType,OptionType } from '../page/type';

export interface CustomDatePickerRef {
    getInputValue: () => string,
}

export type CustomDatePickerProps = {
    width?: number | null;
    height?: number| null;
    onChange: () => void;
    };
 
type CDPProps = InferProps<typeof CustomDatePickerProps>


const CustomDatePicker: FunctionComponent<CDPProps>;
 
export default CustomDatePicker;