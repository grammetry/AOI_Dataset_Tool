import { forwardRef, useImperativeHandle } from 'react';  
import { useDispatch } from 'react-redux';
import { setShow, setMessage } from '../redux/store/slice/currentMessage';

  
const Utility = forwardRef((props, ref) => {

    const dispatch = useDispatch();

    useImperativeHandle(ref, () => ({

        ShowMessage: (myMessage) => {
            dispatch(setMessage(myMessage));
            dispatch(setShow(true));
        }
    }));

    return (
        <>
        </>
    );
});

export default Utility;
