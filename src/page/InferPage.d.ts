import { FunctionComponent } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { GetAllProjectsType } from '../../constant/API';
import { Train } from '@mui/icons-material';


export type InferPageProps = {
    projectData: ProjectDataType[];
    setPageKey: Dispatch<SetStateAction<PageKeyType>>;
    setCurrentProject: Dispatch<SetStateAction<ProjectDataType>>;
    };
 
type IPProps = InferProps<typeof InferPageProps>


const InferPage: FunctionComponent<IPProps>;
 
export default InferPage;