import React, { Dispatch, FormEventHandler, SetStateAction } from 'react';

const InfoTag = (props) => {

    return (
        <>
            {
                (props.size === "sm") ?
                    <div className="my-tag-info-sm d-flex justify-content-center" style={{ border: `1px solid ${props.color}`, backgroundColor: `${props.color}14`, width: props.w1 + props.w2 ,marginTop:3}}>
                        <div style={{ color: "white", backgroundColor: `${props.color}`, padding: '0px 0px', fontWeight: 'bold', fontSize: 12, width: (props.w1) ? props.w1 : 50, height: 16,textAlign:'center' }}>
                            {props.label}
                        </div>
                        <div style={{ color: `${props.color}`, backgroundColor: `${props.color}14`, padding: '0px 0px', fontWeight: 'normal', fontSize: 12, width: (props.w2) ? props.w2 : 50, height: 16, textAlign:'center' }}>
                            {props.value}
                        </div>
                    </div>
                    :
                    <div className="my-tag-info" style={{ border: `1px solid ${props.color}`, backgroundColor: `${props.color}14` }}>
                        <span className="d-flex align-items-center" style={{ color: "white", backgroundColor: `${props.color}`, padding: '0px 10px', fontWeight: 'bold', fontSize: 16, width: (props.w1) ? props.w1 : 80, height: 32 }}>
                            {props.label}
                        </span>
                        <div style={{ color: `${props.color}`, backgroundColor: `${props.color}14`, padding: '0px 10px', fontWeight: 'normal', fontSize: 16, width: (props.w2) ? props.w2 : 150, height: 32, position: 'relative' }}>
                            <span style={{ position: 'absolute', top: 5 }}>{props.value}</span>
                        </div>
                    </div>
            }

        </>
    );
};

export default InfoTag;
