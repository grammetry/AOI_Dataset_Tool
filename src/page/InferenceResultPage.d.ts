import { FunctionComponent } from 'react';
import PropTypes, { InferProps } from 'prop-types';


export type InferenceResultPageProps = {
    projectData: ProjectDataType[];
    setPageKey: Dispatch<SetStateAction<PageKeyType>>;
    setCurrentProject: Dispatch<SetStateAction<ProjectDataType>>;
    };
 
type IRPProps = InferProps<typeof InferenceResultPageProps>


const InferenceResultPage: FunctionComponent<IRPProps>;
 
export default InferenceResultPage;