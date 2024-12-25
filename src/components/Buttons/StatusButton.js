import React,{useEffect} from 'react';
import log from "../../utils/console";
import CustomTooltip from '../Tooltips/CustomTooltip';
import { Tooltip } from '@mui/material';


const StatusButton = ({ name, title, onClick }) => {

    

    const handleClick = () => {
        onClick();
    };


    if (name === "finish") {
        return (
            <button className="my-button-green">
                Finish
            </button>
        )
    }

    if (name === "training") {
        return (
            <button className="my-button-yellow blinking-effect" style={{ width: 79 }}>
                Training
            </button>

        )
    }

    if (name==="task-status"){

        if ((title==="stopping")||(title==="preparing")){ 
            return (


                <button className="my-button-yellow" style={{ width: 79 }}>
                    {title}
                </button>

            )
        }else if ((title==="stop")||(title==="error")){

            return (
                <button className="my-button-red" style={{ width: 79 }}>
                    {title}
                </button>
            )
        }else{
            return (
                <button className="my-button-green" style={{ width: 79 }}>
                    {title}
                </button>
            )
        }
    }



    if (name === "failed") {
        return (
            <button className="my-button-red">
                Fail
            </button>
        )
    }

    if (name === "train-wait") {
        return (
            <button className="my-button-gray" style={{ width: 79 }}>
                Wait
            </button>
        )
    }



    if (name === "train-active") {
        return (
            <button className="my-button-green" style={{ width: 79 }}>
                Train
            </button>
        )
    }

    if (name === "train-failed") {
        return (

            <>
                {
                    (title) ?
                        <CustomTooltip title={title}>
                            <button className="my-button-red" style={{ width: 79 }}>
                                Failure
                            </button>
                        </CustomTooltip>
                        :
                        <button className="my-button-red" style={{ width: 79 }}>
                            Failure
                        </button>

                }
            </>
        )
    }

    if (name === "train-inactive") {
        return (
            <button className="my-button-gray" style={{ width: 79 }} onClick={handleClick}>
                Train
            </button>
        )
    }

    if (name === "evaluate-active") {
        return (
            <button className="my-button-green" style={{ width: 79 }} onClick={handleClick}>
                Evaluate
            </button>
        )
    }

    if (name === "evaluate-running") {
        return (
            <button className="my-button-yellow" style={{ width: 79 }}>
                Evaluating
            </button>
        )
    }

    if (name === "inference-running") {
        return (
            <button className="my-button-yellow" style={{ width: 79 }}>
                Inferencing
            </button>
        )
    }

    if (name === "evaluate-inactive") {
        return (
            <button className="my-button-gray" style={{ width: 79 }} onClick={handleClick}>
                Evaluate
            </button>
        )
    }

    if (name === "inference-active") {
        return (
            <button className="my-button-green" style={{ width: 79 }} onClick={handleClick}>
                Inference
            </button>
        )
    }

    if (name === "inference-inactive") {
        return (
            <button className="my-button-gray" style={{ width: 79 }} onClick={handleClick}>
                Inference
            </button>
        )
    }

    if (name === "export-running") {
        return (
            <button className="my-button-yellow" style={{ width: 79 }}>
                Exporting
            </button>
        )
    }

    if (name === "export-active") {
        return (
            <button className="my-button-green" style={{ width: 79 }} onClick={handleClick}>
                Export
            </button>
        )
    }

    if (name === "export-inactive") {
        return (
            <button className="my-button-gray" style={{ width: 79 }} onClick={handleClick}>
                Export
            </button>
        )
    }





    if (name === "running") {
        return (
            <button className="my-button-run" style={{ width: 100 }}>
                Running
            </button>
        )
    }

    if (name === "wait") {
        return (
            <button className="my-button-red" style={{ width: 100 }}>
                Stop
            </button>
        )
    }

    if (name === "stop") {
        return (
            <button className="my-button-yellow" style={{ width: 100 }}>
                Stopping
            </button>
        )
    }

    if (name === "prepare") {
        return (
            <button className="my-button-yellow" style={{ width: 100 }}>
                Prepare
            </button>
        )
    }

    if (name === "error") {
        return (
            <button className="my-button-red" style={{ width: 100 }}>
                Error
            </button>
        )
    }





    console.log(`name=${name}`)


    return (
        <button className="my-button">

        </button>
    );



};

export default StatusButton;