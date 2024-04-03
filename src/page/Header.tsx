import { useState, FormEventHandler, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import logo from '../image/Dataset_Tool_Logo_white.svg';
import { Slide, Tooltip } from '@mui/material';
import { selectCurrentList } from '../redux/store/slice/currentSelected';
import { selectCurrentMessage, setMessage, setShow } from '../redux/store/slice/currentMessage';
import ConfirmDialog from '../dialog/ConfirmDialog';

import { AttributeType,ProgressType } from './type';
import { ToastContainer, toast, cssTransition } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Header = () => {

    const dispatch = useDispatch();

    const somethingChange = useSelector(selectCurrentList).somethingChange;
    const show = useSelector(selectCurrentMessage).show;
    const message = useSelector(selectCurrentMessage).message;


    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);


    const handleWindowReload = () => {
        if (somethingChange) {
            console.log('show dialog')
            setOpenConfirmDialog(true);
        } else {
            console.log('reload directly')
            window.location.reload();
        }
    }

    const handleConfirmLeave: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        setOpenConfirmDialog(false);
        window.location.reload();

    };

    const confirmLeaveAttribute: AttributeType = {
        title: 'Confirm leave',
        desc: 'You have unsaved changes.<br/>Are you sure to leave?',
    };

    const currentProgressAttribute: ProgressType = {
        message: '',
        percent: 0,
    };

    const swirl = cssTransition({
        enter: "swirl-in-fwd",
        exit: "swirl-out-bck"
    });

    useEffect(() => {

        if (show)
            toast(message, {
                style: {
                    backgroundColor: '#ed1b23',
                    width: 800,
                    height: 44,
                    fontSize:'16px',
                    minHeight: 44,
                    color: 'white',
                    left:-250
                },
                
                closeOnClick: true,
                position: "bottom-center",
                pauseOnHover: true,
                draggable: false,
                theme: "light",
            });
        dispatch(setShow(false));
        dispatch(setMessage(''));

    }, [show]);




    return (
        <>
            <ToastContainer
                position="bottom-center"
                autoClose={3000}
                hideProgressBar={true}
                newestOnTop={true}
                closeOnClick={true}
                closeButton={false}
                rtl={false}
                pauseOnFocusLoss
                draggable={false}
                pauseOnHover
                bodyClassName={"my-toast-body"}

            />
            <div className="header">
                {/* <div className="header-text" onClick={() => window.location.reload()}> */}
                <div className="header-text" onClick={handleWindowReload}>
                    <Tooltip enterDelay={500} enterNextDelay={500} title="Home" arrow>
                        <div className="flex-row-center">
                            <img src={logo} alt="logo icon" style={{ width: 38, height: 38 }} />
                            {/* <FontAwesomeIcon icon={faScrewdriverWrench} size="sm" color="#fff" /> */}
                            &nbsp;Dataset Tool
                        </div>
                    </Tooltip>
                </div>
            </div>
            <ConfirmDialog
                openConfirmDialog={openConfirmDialog}
                setOpenConfirmDialog={setOpenConfirmDialog}
                handleConfirm={handleConfirmLeave}
                confirmAttribute={confirmLeaveAttribute}
            />
           
        </>
    );
};

export default Header;
