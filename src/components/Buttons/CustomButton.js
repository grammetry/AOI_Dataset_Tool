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
                <button onClick={props.onClick} className="my-button-submit" style={{width:props.width,height:props.height}}>
                    OK
                </button>
            )
        }

        if (props.name==="view"){
            return (
                <button onClick={(e)=>props.onClick(e)} className={(props.disabled)?"my-button-disable":"my-button-submit"} style={{width:props.width,height:props.height}} disabled={props.disabled}>
                    {props.text}
                </button>
            )
        }

        if (props.name==="button-type-1"){
            return (
                <div onClick={props.onClick} className={(props.disabled)?"my-button-disable":"my-button-type-1"} style={{width:props.width,height:props.height}} disabled={props.disabled}>
                    {props.text}
                </div>
            )
        }

        if (props.name==="button-type-2"){
            return (
                <div onClick={props.onClick} className={(props.disabled)?"my-button-disable":"my-button-type-2"} style={{width:props.width,height:props.height}} disabled={props.disabled}>
                    {props.text}
                </div>
            )
        }

        if (props.name==="submit"){
            return (
                <button type="submit" onClick={props.onClick} className={(props.disabled)?"my-button-disable":"my-button-submit"} style={{width:props.width,height:props.height}} disabled={props.disabled}>
                    {props.text}
                </button>
            )
        }

        if (props.name==="function"){
            return (
                <div onClick={props.onClick} className={(props.focus)?"my-button-function-focus":"my-button-function"} style={{width:props.width,height:props.height}}>
                    {props.text}
                </div>
            )
        }

        if (props.name==="outline"){
            return (
                <div onClick={props.onClick} className="my-button-outline" style={{width:props.width,height:props.height}}>
                    {props.text}
                </div>
            )
        }

        if (props.name==="general"){
            return (
                <div onClick={props.onClick} className="my-button-general" style={{width:props.width,height:props.height}}>
                    {props.text}
                </div>
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
                <button onClick={(e)=>props.onClick(e)} className="my-button-cancel" style={{width:props.width,height:props.height}}>
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
                <button onClick={props.onClick} className="my-button-cancel" style={{width:props.width,height:props.height}}>
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
                <button onClick={props.onClick} className="my-button-submit" style={{width:props.width,height:props.height}}>
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
    name:PropTypes.string,
    text:PropTypes.string,
    width:PropTypes.number,
    height:PropTypes.number,
}

export default CustomButton;