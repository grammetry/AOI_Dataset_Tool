import React, { Dispatch, FormEventHandler, SetStateAction } from 'react';

const FilterPanel = (props) => {

    const handleLabelToggle = (imageUuid) => {
        props.onChange(imageUuid);
    }

    return (
        <div> 
            filter panel
        </div>
    );
};

export default FilterPanel;

