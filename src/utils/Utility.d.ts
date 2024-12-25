import { FunctionComponent } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { GetAllProjectsType } from '../../constant/API';
import { Train } from '@mui/icons-material';
import Utility from './Utility';
import { ErrorDetailType } from '../page/type';

type UtilProps = {

};

export interface UtilityRef {
    showMessage: (value: string) => void,
    setLoaidng: (value: boolean) => void,
    setCurrentTab: (value: string) => void,
    getCurrentTab: () => string,
    showErrorMessage: (value: ErrorDetailType) => void,
}

export type UtilProps = {
    ref: RefObject<HTMLDivElement>;
};

type UtilityProps = InferProps<typeof UtilProps>


const Utility: FunctionComponent<UtilityProps>;

export default Utility;