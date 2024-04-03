import React, { useImperativeHandle, forwardRef, useRef, useState } from 'react';
import Select from "react-select";
import { OptionType } from '../../page/type';

type Props = {
    onChange: (item: OptionType | null) => void;
    options: OptionType[];
    className: string;
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

        <Select<OptionType, false> options={props.options} className={props.className} onChange={(item) => { setCurrentItem(item);props.onChange(item) }} value={currentItem} />

    )
})

export default ModelSelector
