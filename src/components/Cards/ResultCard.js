import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import log from "../../utils/console";
import ReactDOM from "react-dom";
import { useCountUp } from "use-count-up";
import { datasetImgAPI } from '../../APIPath';
import ToggleButton from '../../components/Buttons/ToggleButton';




const ResultCard = forwardRef((props, ref) => {

    const { currentStep, totalStep } = props;

   
    useImperativeHandle(ref, () => ({

       
    }));

   

    useEffect(() => {

       

    }, []);

    return (

        <>
            <div className="container-fluid my-result-card mt-2" style={{paddingTop:5}}>
                
                <div className="row">
                    <div className="col d-flex flex-row gap-3">
                        <div className="my-image-container">
                            <div className="my-image-title">Image</div>
                            <div className="my-image-frame">
                                <img src={datasetImgAPI(props.data.imageUuid)} />
                            </div>
                        </div>
                        <div className="my-image-container">
                            <div className="my-image-title">Golden</div>
                            <div className="my-image-frame">
                                <img src={datasetImgAPI(props.data.goldenUuid)}/>
                            </div>
                            
                        </div>
                        <div className="d-flex flex-column gap-2">
                            
                            <div className="my-tag-2">
                                <span>{props.data.label}</span>
                                <div style={{position:'relative'}}>
                                    <div style={{position:'absolute',left:-30,top:2}}>
                                        <ToggleButton status={(props.data.label==="PASS")?"run":"stop"}></ToggleButton>
                                        {/* <ToggleButton status="stop"></ToggleButton> */}
                                    </div>
                                </div>
                                
                            </div>
                            <div className="my-tag-1">{props.data.compName}</div>
                            <div className="my-tag-3">{props.data.score}</div>
                            
                        </div>
                    </div>
                </div>
            </div>
        </>
       

    );
});

export default ResultCard;

