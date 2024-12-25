import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import log from "../../utils/console";
import ReactDOM from "react-dom";
import styled,{keyframes} from 'styled-components';


const Container = styled.div`
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Blinking = keyframes`
    50%   {
        transform: scale(2);
        opacity: 0
    }
    100%   {
        transform: scale(2);
        opacity: 0
    }
`;




const Circle = styled.div.attrs({})`
    content: " ";
    margin: 15px;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    margin: 0 auto;
    transition: all 1s;
    background-color: ${props => props.color };

    &:before {
        
        animation-name: ${props => props.blink===true ? Blinking : ""};
        animation-iteration-count: infinite;
        animation-duration: 2s;
        position: absolute;
        content: " ";
        margin: 15px;
        width: 15px;
        height: 15px;
        border-radius: 50%;
        margin: 0 auto;
        transition: all 1s;
        background-color:  ${props => props.color };
    }

   
`;

const CustomLight = forwardRef((props, ref) => {

    const { currentStep, totalStep } = props;

    useImperativeHandle(ref, () => ({


    }));


    useEffect(() => {


    }, []);

    return (

        <Container>
            <Circle color={props.color} blink={props.blink} style={props.style}/>
        </Container>

    );
});

export default CustomLight;

