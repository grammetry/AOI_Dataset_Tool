import React, { useImperativeHandle, forwardRef, useRef, useState, useEffect } from 'react';
import Select from "react-select";
import { OptionType } from '../../page/type';


const ServerSelector = forwardRef((props, ref) => {

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

    useEffect(() => {

        if (currentItem==null){
            setCurrentItem(props.defaultValue);

        }
          
     }, [props.defaultValue]);

     useEffect(() => {

        if ((currentItem==null)&&(props.options.length>0)){
            setCurrentItem(props.options[0]);
            props.onChange(props.options[0])

        }
          
     }, [props.options]);



    return (

        <Select options={props.options} className={props.className}
            styles={{
                control: (baseStyles, state) => ({
                    ...baseStyles,
                    borderColor: (props.warnning)?'#B00020' : state.isFocused ? '#16272e3d' : '#979CB580',
                    borderWidth: state.isFocused ? '1px' : '1px',
                    width: (props.width)? props.width : '100%',
                    minHeight: '40px',
                    height: '40px',
                    boxShadow: state.isFocused ? '0 0 0 0px #16272e3d' : 'none',
                   
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
            // sx={{
                
            //     '&:focus-within::before': {
            //         transform: 'scaleX(0)',
            //       },
            // }}
            
            onChange={(item) => { setCurrentItem(item); props.onChange(item) }} value={currentItem} />

    )
})

export default ServerSelector
