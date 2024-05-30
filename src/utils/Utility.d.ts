import { FunctionComponent } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { GetAllProjectsType } from '../../constant/API';
import { Train } from '@mui/icons-material';
import Utility from './Utility';


type UtilProps = {
    
};

export interface UtilityRef {
    ShowMessage: (value: string) => void,
    SetLoaidng: (value: boolean) => void,
}

export type UtilProps = {
    ref: RefObject<HTMLDivElement>;
    };
 
type UtilityProps = InferProps<typeof UtilProps>


const Utility: FunctionComponent<UtilityProps>;
 
export default Utility;