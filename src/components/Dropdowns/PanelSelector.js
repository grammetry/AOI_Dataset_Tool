import React, { useImperativeHandle, forwardRef, useRef, useState } from 'react';
import Select from "react-select";
import { OptionType } from '../../page/type';

const PanelSelector = forwardRef((props, ref) => {

    const [currentItem, setCurrentItem] = useState(null);

    useImperativeHandle(ref, () => {
        return {
            setValue(value) {
                setCurrentItem(value);
            },
            getValue() {
                return currentItem;
            },

        }
    }, [currentItem])



    return (

        <Select
            styles={{
                control: (baseStyles, state) => ({
                    ...baseStyles,
                    borderColor: state.isFocused ? '#16272e3d' : '#E0E1E6',
                    borderWidth: state.isFocused ? '0px' : '1px',
                }),
            }}
            theme={(theme) => ({
                ...theme,
                colors: {
                    ...theme.colors,
                    primary25: '#E0E1E6',
                    primary75: '#E0E1E6',
                    primary50: '#E0E1E6',
                    primary: '#16272e3d',
                },
            })}
            components={{
                IndicatorSeparator: () => null
            }}
            options={props.options} className={props.className}
            onChange={(item) => { setCurrentItem(item); props.onChange(item) }} value={currentItem} />

    )
})

export default PanelSelector
