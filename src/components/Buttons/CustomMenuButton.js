import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import log from "../../utils/console";
import styled from 'styled-components';


import MenuButton from '@mui/joy/MenuButton';
import Menu from '@mui/joy/Menu';
import MenuItem from '@mui/joy/MenuItem';
import Apps from '@mui/icons-material/Apps';
import Dropdown from '@mui/joy/Dropdown';


const CheckBoxWrapper = styled.div`
position: relative;
`;

const CheckBoxLabel = styled.label`
position: absolute;
top: 0;
left: 0;
width: 36px;
height: 20px;
border-radius: 15px;
background: #FF359A;
cursor: pointer;
&::after {
content: "";
display: block;
border-radius: 50%;
width: 14px;
height: 14px;
margin: 3px;
background: #ffffff;

transition: 0.2s;
}
`;

const CheckBox = styled.input`
opacity: 0;
z-index: 1;
border-radius: 15px;
width: 42px;
height: 26px;
&:checked + ${CheckBoxLabel} {
background: #21D59B;
&::after {
    content: "";
    display: block;
    border-radius: 50%;
    width: 14px;
    height: 14px;
    margin-left: 20px;
    transition: 0.2s;
}
}
`;

// function ToggleButton({ onChange, status }) {
const CustomMenuButton = forwardRef((props, ref) => {

    const [isChecked, setIsChecked] = useState(props.status === "run" ? true : false);
    const [disabled, setDisabled] = useState(false);

    const [selectedIndex, setSelectedIndex] = React.useState(0);

    const myMenuList=['Task','Model','Log'];

    const createHandleClose = (index) => () => {
      if (typeof index === 'number') {
        setSelectedIndex(index);
        props.onChange(myMenuList[index]);
      }
    };
  

    const handleCheckboxChange = (event) => {

        //log('checked?')
        //log(event.target.checked)
        //setDisabled(true);
        setIsChecked(event.target.checked);
        props.onChange(event.target.checked);


    };

    useImperativeHandle(ref, () => ({

        getDisabled: () => {
            return disabled;
        },

        getValue: () => {
            return isChecked;
        },

        setValue: (myValue) => {
            setIsChecked(myValue);
        },

    }));


    useEffect(() => {

      

    }, []);

    return (

        <Dropdown>
            <MenuButton variant="solid" sx={{ 
                width:100,
                maxHeight:32,
                minHeight:32,
                height:32,
                color:'white',
                fontFamily:'Roboto',
                fontSize:16,
                fontWeight:300,
                backgroundColor:'#E61F23',
                paddingTop:1,
                '&:hover': {
                    backgroundColor: '#FF5B5B',
                },
            }}>Menu</MenuButton>
            <Menu>
                <MenuItem sx={{width:100}}
                    {...(selectedIndex === 0 && { selected: true, variant: 'soft' })}
                    onClick={createHandleClose(0)}
                >
                    Task
                </MenuItem>
                <MenuItem selected={selectedIndex === 1} onClick={createHandleClose(1)}>
                    Model
                </MenuItem>
                <MenuItem selected={selectedIndex === 2} onClick={createHandleClose(2)}>
                    Log
                </MenuItem>
            </Menu>
        </Dropdown>
    );
});

export default CustomMenuButton;
