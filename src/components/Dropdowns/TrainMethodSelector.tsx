import React, { useImperativeHandle, forwardRef, useRef, useState, useEffect } from 'react';
import Select from "react-select";
import { OptionType } from '../../page/type';

type Props = {
    onChange: (item: OptionType | null) => void;
    options: OptionType[];
    className: string;
    defaultOption?: OptionType|null;
};

export interface TrainMethodSelectorRef {
    setValue: (value: OptionType) => void,
    getValue: () => OptionType | null,
}

const TrainMethodSelector = forwardRef<TrainMethodSelectorRef, Props>(function TrainMethodSelector(props: Props, ref) {

    const [currentItem, setCurrentItem] = useState<OptionType | null>(props.defaultOption || null);

   
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

export default TrainMethodSelector
