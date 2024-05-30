import { FunctionComponent } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { GetAllProjectsType } from '../../constant/API';
import { Train } from '@mui/icons-material';


export type TrainPageProps = {
    projectData: ProjectDataType[];
    setPageKey: Dispatch<SetStateAction<PageKeyType>>;
    setCurrentProject: Dispatch<SetStateAction<ProjectDataType>>;
    };
 
type TPProps = InferProps<typeof TrainPageProps>


const TrainPage: FunctionComponent<TPProps>;
 
export default TrainPage;