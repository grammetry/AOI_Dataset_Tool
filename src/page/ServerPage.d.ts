import { FunctionComponent } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { GetAllProjectsType } from '../../constant/API';
import { Train } from '@mui/icons-material';


export type ServerPageProps = {
    projectData: ProjectDataType[];
    setPageKey: Dispatch<SetStateAction<PageKeyType>>;
    setCurrentProject: Dispatch<SetStateAction<ProjectDataType>>;
    };
 
type SPProps = InferProps<typeof ServerPageProps>


const ServerPage: FunctionComponent<SPProps>;
 
export default ServerPage;