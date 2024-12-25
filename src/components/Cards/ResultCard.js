import React, { useState, forwardRef, useImperativeHandle, useEffect, useRef } from "react";
import log from "../../utils/console";
import ReactDOM from "react-dom";
import { useCountUp } from "use-count-up";
import { datasetImgAPI } from '../../APIPath';
import ToggleButton from '../../components/Buttons/ToggleButton';
import InfoTag from '../../components/Tags/InfoTag';
import Image_default from '../../image/Image_Default.svg';

const ResultCard = (props) => {

    const { currentStep, totalStep } = props;

    const toggleRef = useRef(null);

    const handleLabelToggle = () => {
      
        props.onChange();
    };

   
    // useImperativeHandle(ref, () => ({

       
    // }));

    const replaceImage = (error) => {
        //replacement of broken Image
        
        //error.target.height = "250px";
        //error.target.style="{{ height: 53, width: 36 }}"
        error.target.src = Image_default;
        error.target.width = 380;
        error.target.height = 280;
    }
   

    useEffect(() => {

       

    }, []);

    return (

        <>
            <div className="container-fluid my-result-card mt-2" style={{paddingTop:5}}>
                
                <div className="row">
                    <div className="col d-flex flex-row gap-3">

                       
                        <div className={(props.data.label==="PASS")?"my-image-container-pass":"my-image-container-ng"}>
                            <div className={(props.data.label==="PASS")?"my-image-title-pass":"my-image-title-ng"}>Image</div>
                            <div className="my-image-frame d-flex justify-content-center align-items-center">
                                <img src={datasetImgAPI(props.data.imageUuid)} onError={replaceImage} style={{maxWidth:390,maxHeight:290}}/> 

                                
                            </div>
                        </div>
                       
                        <div className="my-image-container">
                            <div className="my-image-title">Golden</div>
                            <div className="my-image-frame d-flex justify-content-center align-items-center">
                                <img src={datasetImgAPI(props.data.goldenUuid)} onError={replaceImage} style={{maxWidth:390,maxHeight:290}}/> 
                            </div>
                            
                        </div>
                        <div className="d-flex flex-column gap-2">
                            
                           
                            <InfoTag label="Order" value={props.data.sortIndex+1} color="#E61F23" />
                            <InfoTag label="PartNo." value={props.data.compName} color="#57B8FF" />
                            <InfoTag label="Light" value={props.data.lightSource} color="#383EF5" />
                            <InfoTag label="Score" value={props.data.score} color="#8E44AD" />

                            <div className={(props.data.label==="PASS")?"my-tag-pass":"my-tag-ng"}>
                                <span>{props.data.label}</span>
                                <div style={{position:'relative'}}>
                                    <div style={{position:'absolute',left:-30,top:2}}>
                                        <ToggleButton id={props.data.imageUuid} status={(props.data.label==="PASS")?"run":"stop"} onChange={handleLabelToggle} ref={toggleRef}></ToggleButton>    
                                    </div>
                                </div>                        
                            </div>
                            
                            
                            
                        </div>
                    </div>
                </div>
            </div>
        </>
       

    );
};

export default ResultCard;

