import React, { useImperativeHandle, forwardRef, useRef, useState } from 'react';
import Select from "react-select";
import { OptionType } from '../../page/type';

type Props = {
    onChange: (item: OptionType | null) => void;
    options: OptionType[];
    className?: string | null;
    width?: number | null;
    defaultOption?: OptionType;
};

export interface ModelSelectorRef {
    setValue: (value: OptionType) => void,
    getValue: () => OptionType | null,
}

const ModelSelector = forwardRef<ModelSelectorRef, Props>(function ModelSelector(props: Props, ref) {

    const [currentItem, setCurrentItem] = useState<OptionType | null>(null);

    useImperativeHandle(ref, () => {
        return {
            setValue(value: OptionType | null) {
                setCurrentItem(value);
            },
            getValue() {
                return currentItem;
            },

        }
    }, [currentItem])
    return (

        <Select<OptionType, false>
            styles={{
                control: (baseStyles, state) => ({
                    ...baseStyles,
                    borderColor: state.isFocused ? '#16272e3d' : '#979CB580',
                    borderWidth: state.isFocused ? '0px' : '1px',
                    width: (props.width)? props.width : '100%',

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
            options={props.options} className={(props.className)?props.className:''} onChange={(item) => { setCurrentItem(item); props.onChange(item) }} value={currentItem} />

    )
})

export default ModelSelector
