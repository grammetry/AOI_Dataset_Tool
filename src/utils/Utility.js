import { forwardRef, useImperativeHandle, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentMessage, setShow, setMessage, setCurrentTaoModelId, setCurrentTaoModelName, setCurrentExportId, setCurrentTab } from '../redux/store/slice/currentMessage';
import CustomLoading from '../components/Loadings/CustomLoading';
import { ToastContainer, toast, cssTransition, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Utility = forwardRef((props, ref) => {

    const dispatch = useDispatch();

    const [openProgressDialog, setOpenProgressDialog] = useState(false);

    const currentTaoModelId = useSelector(selectCurrentMessage).currentTaoModelId;
    const currentTaoModelName = useSelector(selectCurrentMessage).currentTaoModelName;
    const currentExportId = useSelector(selectCurrentMessage).currentExportId;
    const currentTab = useSelector(selectCurrentMessage).currentTab;

    const toastId = useRef(null);

    const setLocalMessage = (message) => {

        console.log(`setLocalMessage : ${message}`);

            toast(message, {
                style: {
                    backgroundColor: '#16272E',
                    width: 800,
                    height: 44,
                    fontSize: '16px',
                    minHeight: 44,
                    color: 'white',
                    left: -250,
                    paddingLeft: 200
                },
            });

           // toast(message);
        
    }


    useImperativeHandle(ref, () => ({

        showMessage: (myMessage) => {
           
            setLocalMessage(myMessage);
        },
        showGlobalMessage: (myMessage) => {

            dispatch(setMessage(myMessage));
            dispatch(setShow(true));
        },
        setLoading: (myToggle) => {
            setOpenProgressDialog(myToggle);
        },
        setCurrentTaoModelId: (myTaoModelId) => {
            dispatch(setCurrentTaoModelId(myTaoModelId));
        },
        getCurrentTaoModelId: () => {
            return currentTaoModelId;
        },
        setCurrentTaoModelName: (myTaoModelName) => {
            dispatch(setCurrentTaoModelName(myTaoModelName));
        },
        getCurrentTaoModelName: () => {
            return currentTaoModelName;
        },
        setCurrentExportId: (myExportId) => {
            dispatch(setCurrentExportId(myExportId));
        },
        getCurrentExportId: () => {
            return currentExportId;
        },
        setCurrentTab: (myTab) => {
            dispatch(setCurrentTab(myTab));
        },
        getCurrentTab: () => {
            return currentTab;
        },
        showErrorMessage: (myError) => {
            const msg = myError?.[0]?.msg || '';
            const loc = myError?.[0]?.loc || [];
            //dispatch(setMessage(`API error : ${msg} [${loc.join(', ')}]`));
            //dispatch(setMessage(`API error : ${msg}`));
            //dispatch(setShow(true));
            //console.log(`API error : aaa`)
            setLocalMessage(`API error : ${msg}`);
            //setLocalMessage(`API error : aaa`);

        },
    }));

    return (
        <>
            <CustomLoading
                openProgressDialog={openProgressDialog}
                setOpenProgressDialog={setOpenProgressDialog}
                progressAttribute={{ "message": "Loading", "percent": "" }}
            />
            
            <ToastContainer
                position="bottom-center"
                autoClose={2000}
                hideProgressBar={true}
                newestOnTop={true}
                closeOnClick={true}
                closeButton={false}
                rtl={false}
                pauseOnFocusLoss
                draggable={false}
                pauseOnHover
                bodyClassName={"my-toast-body"}
                transition={Slide}
                limit={1}

            /> 


               
        </>
    );
});

export default Utility;
