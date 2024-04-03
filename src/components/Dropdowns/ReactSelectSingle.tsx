import React, { forwardRef,useState,useRef } from "react";
import ReactSelect, { Props } from "react-select";
import styled from '@emotion/styled';


import { OptionType } from '../../page/type';
import { PropaneSharp } from "@mui/icons-material";



// const colourStyles = {
//   menuList: styles => ({
//     ...styles,
//     background: 'papayawhip',
//   }),
//   option: (styles, { isFocused, isSelected }) => ({
//     ...styles,
//     background: isFocused
//       ? 'hsla(291, 64%, 42%, 0.5)'
//       : isSelected
//         ? 'hsla(291, 64%, 42%, 1)'
//         : undefined,
//     zIndex: 1,
//   }),
//   menu: base => ({
//     ...base,
//     zIndex: 100,
//   }),
// }

// const CustomStyle = {
//   option: (base, state) => ({
//     ...base,
//     backgroundColor: state.isSelected ? {Color1} : {Color2},
//   })
// }

// const theme = theme => ({
//   ...theme,
//   colors: {
//     ...theme.colors,
//     primary25: "#f3f3f3",
//     primary: "pink"

//     // All possible overrides
//     // primary: '#2684FF',
//     // primary75: '#4C9AFF',
//     // primary50: '#B2D4FF',
//     // primary25: '#DEEBFF',

//     // danger: '#DE350B',
//     // dangerLight: '#FFBDAD',

//     // neutral0: 'hsl(0, 0%, 100%)',
//     // neutral5: 'hsl(0, 0%, 95%)',
//     // neutral10: 'hsl(0, 0%, 90%)',
//     // neutral20: 'hsl(0, 0%, 80%)',
//     // neutral30: 'hsl(0, 0%, 70%)',
//     // neutral40: 'hsl(0, 0%, 60%)',
//     // neutral50: 'hsl(0, 0%, 50%)',
//     // neutral60: 'hsl(0, 0%, 40%)',
//     // neutral70: 'hsl(0, 0%, 30%)',
//     // neutral80: 'hsl(0, 0%, 20%)',
//     // neutral90: 'hsl(0, 0%, 10%)',
//   }
//   // Other options you can use
//   // borderRadius: 4
//   // baseUnit: 4,
//   // controlHeight: 38
//   // menuGutter: baseUnit * 2
// });


type MySelectProp = {
  width: number,
  onChange: (option:any) => void
}

const MySelect = styled(ReactSelect)`

    width:${(props: MySelectProp) => props.width }px;

    &.Select {
      width:200px;
      
    }
    &.Select--single  {

        .Select-value {
            display: inline-flex;
            align-items: center;
        }
    }

    & .Select-placeholder {
        font-size: smaller;
    }
`


// const Select = forwardRef<any, Props>((props, ref) => (
//   <MySelect ref={ref} {...props} width={500}/>
// ));

export default function ReactSelectSingle ({options,width,onChange,className,ref}:{options:OptionType[],width:number,onChange: (option:OptionType|null) => void,className?:string,ref:any}) {

  const [item, setItem] = useState<OptionType | null>(null);

  const customRef = useRef<any>();

  const handleChange=(option:OptionType|null)=>{
    setItem(option);
    onChange(option);
  } 

  return (
    <div className="ReactSelectSingle">
      {/* <Select 
        options={options}
        width={width}
      /> */}
       {/* <MySelect options={options} onChange={handleOption} width={width} value={item}/> */}
       <ReactSelect options={options} onChange={handleChange} value={item}  className={className}  ref={customRef}/>
    </div>
  );
}
