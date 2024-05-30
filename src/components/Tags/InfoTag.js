import React, { Dispatch, FormEventHandler, SetStateAction } from 'react';

const InfoTag = (props) => {

    return (
        <>
            <div className="my-tag-info" style={{ border: `1px solid ${props.color}`, backgroundColor: `${props.color}14` }}>
                <span className="d-flex align-items-center" style={{ color:"white", backgroundColor: `${props.color}`, padding:'0px 10px' ,fontWeight:'bold',fontSize:16,width:80, height: 32}}>
                    {props.label}
                </span>
                <div style={{ color:`${props.color}`, backgroundColor: `${props.color}14`, padding:'0px 10px' ,fontWeight:'normal',fontSize:16,width:150, height: 32,position:'relative'}}>
                    <span style={{position:'absolute',top:5}}>{props.value}</span>
                </div>
            </div>
        </>
    );
};

export default InfoTag;
