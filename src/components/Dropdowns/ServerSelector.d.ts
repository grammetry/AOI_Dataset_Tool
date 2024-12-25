import { FunctionComponent } from 'react';
import PropTypes, { InferProps } from 'prop-types';

import { ProjectDataType,OptionType } from '../page/type';

export interface ServerSelectorPropsRef {
    SetOpen: () => void,
}

export type ServerSelectorProps = {
    defaultValue: string;
    className: string;
    options: OptionType[];  
    width: number | null;
    onChange: (OptionType) => void;
    };
 
type SSProps = InferProps<typeof ServerSelectorProps>

const ServerSelector: FunctionComponent<SSProps>;
 
export default ServerSelector;