import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useSelector, useDispatch } from "react-redux";
import OutsideClickHandler from 'react-outside-click-handler';
import log from "../../utils/console";
import { ReactComponent as Icon_More } from '../../image/Icon_More.svg';

// function ToggleButton({ onChange, status }) {
const ExtendButton = forwardRef((props, ref) => {

    const [disabled, setDisabled] = useState(false);

    const [showExtendMenu, setShowExtendMenu] = useState(false);

    const [buttonClassName, setButtonClassName] = useState('');



    const dispatch = useDispatch();


    const handleButtonClick = (event) => {
        event.stopPropagation();

        setShowExtendMenu(!showExtendMenu)
    };


    const handleDeleteClick = (event) => {
        event.stopPropagation();
        props.onDeleteTask(props.uuid,props.projectName);
        setShowExtendMenu(false);
   
    };

   
    useImperativeHandle(ref, () => ({

        getDisabled: () => {
            return disabled;
        },

    }));


    useEffect(() => {

        switch (props.type) {
            case 1:
                setButtonClassName('my-extend-button-1')
                break;
           
            default:
                setButtonClassName('my-extend-button-1')

        }


    }, [props.type]);

    // useEffect(() => {

    //    log('uuid-----')
    //    log(props.uuid)

    // }, [props.uuid]);

    return (
        <div style={{ position: 'relative', width: 32, height: 32 }}>
            <div className={buttonClassName} onClick={handleButtonClick} style={{ position: 'absolute', left: 0 }} name={`extendButton_${props.uuid}`} >
                <Icon_More name={`extendButton_${props.uuid}`} ></Icon_More>
            </div>

            <Icon_More ></Icon_More>
            {
                showExtendMenu ?

                    // <div className='my-extend-menu' style={{ position: 'absolute', left: -108, top: 32, zIndex: 5 }} onMouseLeave={(e) => setShowExtendMenu(false)}>
                    <OutsideClickHandler
                        onOutsideClick={(evt) => {
                          
                            const actionName = evt.target.getAttribute('name');
                          
                            if (actionName!=null){
                                const uuid=actionName.replace("extendButton_","");
                                if (props.uuid!==uuid){
                                    setShowExtendMenu(false);
                                }
                            }else{
                                setShowExtendMenu(false);
                            }
        
                        }}
                    >
                        <div className='my-extend-menu' style={{ position: 'absolute', left: -108, top: 32, zIndex: 5 }} >

                            {
                                (props.type === 1) &&
                                <div className='my-extend-menu-item' onClick={handleDeleteClick}>
                                    Delete
                                </div>

                            }

                       

                        </div>
                    </OutsideClickHandler>
                    :
                    <></>
            }

        </div>

    );
});

export default ExtendButton;
