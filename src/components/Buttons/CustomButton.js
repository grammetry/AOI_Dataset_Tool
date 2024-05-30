import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus,faHouse } from '@fortawesome/free-solid-svg-icons';



const CustomButton = (props) => {

   // const {name}=props;

        if (props.name==="edit"){
            return (
                <button onClick={props.onClick} className="my-button-edit" style={{width:parseInt(props.width)}} >
                    Edit
                </button>
            )
        }

       
        if (props.name==="confirm"){
            return (
                <button onClick={props.onClick} className="my-button-submit">
                    OK
                </button>
            )
        }

        if (props.name==="view"){
            return (
                <button onClick={props.onClick} className="my-button-submit" style={{width:props.width,height:props.height}}>
                    View
                </button>
            )
        }

        if (props.name==="train"){
            return (
                <button onClick={()=>props.onClick('train')} className={(props.active)?"my-button-small-active":"my-button-small-inactive"} style={{width:props.width,height:props.height}}>
                    train
                </button>
            )
        }

        if (props.name==="val"){
            return (
                <button onClick={()=>props.onClick('val')} className={(props.active)?"my-button-small-active":"my-button-small-inactive"}  style={{width:props.width,height:props.height}}>
                    val
                </button>
            )
        }



        if (props.name==="cancel"){
            return (
                <button onClick={props.onClick} className="my-button-cancel">
                    Cancel
                </button>
            )
        }

        if (props.name==="stop"){
            return (
                <button onClick={props.onClick} className="my-button-cancel" style={{width:props.width,height:props.height}}>
                    Stop
                </button>
            )
        }

        if (props.name==="stop-dialog"){
            return (
                <button onClick={props.onClick} className="my-button-submit" style={{width:props.width,height:props.height}}>
                    Stop
                </button>
            )
        }

        if (props.name==="close"){
            return (
                <button onClick={props.onClick} className="my-button-cancel">
                    Close
                </button>
            )
        }

        if (props.name==="submit"){

            if (props.disabled){
                return (
                    <button className="my-button-disable">
                        Add
                    </button>
                )
            }else{
                return (
                    <button onClick={props.onClick} className="my-button-submit">
                        Add
                    </button>
                )
            }
            
        }

        if (props.name==="save"){
            if (props.disabled){
                return (
                    <button className="my-button-disable">
                        Save
                    </button>
                )
            }else{
                return (
                    <button onClick={props.onClick} className="my-button-submit">
                        Save
                    </button>
                )
            }
        }

        if (props.name==="delete"){
            return (
                <button onClick={props.onClick} className="my-button-submit">
                    Delete
                </button>
            )
        }

        if (props.name==="download"){
            return (
                <button onClick={props.onClick} className="my-button-submit" style={{width:110}}>
                    Download
                </button>
            )
        }


        return (
            <button onClick={props.onClick} className={props.className}>
                {props.name}
            </button>
        );

       
    
};

CustomButton.propTypes = {
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
}

export default CustomButton;