import { forwardRef, useImperativeHandle,useState } from 'react';  
import { useDispatch } from 'react-redux';
import { setShow, setMessage } from '../redux/store/slice/currentMessage';
import CustomLoading from '../components/Loadings/CustomLoading';

  
const Utility = forwardRef((props, ref) => {

    const dispatch = useDispatch();

    const [openProgressDialog, setOpenProgressDialog] = useState(false);

    useImperativeHandle(ref, () => ({

        ShowMessage: (myMessage) => {
            dispatch(setMessage(myMessage));
            dispatch(setShow(true));
        },

        SetLoading: (myToggle) => {
            setOpenProgressDialog(myToggle);
        }
    }));

    return (
        <>
            <CustomLoading
                openProgressDialog={openProgressDialog}
                setOpenProgressDialog={setOpenProgressDialog}
                progressAttribute={{ "message": "Loading", "percent": "" }}
            />
        </>
    );
});

export default Utility;
