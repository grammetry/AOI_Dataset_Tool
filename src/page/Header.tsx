import { useState, FormEventHandler, useEffect, Dispatch, SetStateAction } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import logo from '../image/Dataset_Tool_Logo_white.svg';
import { Tooltip } from '@mui/material';
import { selectCurrentList } from '../redux/store/slice/currentSelected';
import { selectCurrentMessage, setCurrentTaoEvaluateId,setCurrentTaoInferenceId, setCurrentTaoExportId, setMessage, setShow } from '../redux/store/slice/currentMessage';
import ConfirmDialog from '../dialog/ConfirmDialog';
import CustomButton from '../components/Buttons/CustomButton';
import LogoIcon from '../image/iVIT_Logo.png';

import { AttributeType, ProgressType, PageKeyType } from './type';
import { ToastContainer, toast, cssTransition, Slide } from 'react-toastify';

import { taoWorkspaceAPI, taoEvaluateAPI, taoInferenceAPI, taoExportAPI } from '../APIPath';
import { orderBy } from 'lodash-es';



import 'react-toastify/dist/ReactToastify.css';
import { set } from 'lodash';

type HeaderProps = {

    setPageKey: Dispatch<SetStateAction<PageKeyType>>;
    pageKey: PageKeyType;

};


const Header = (props: HeaderProps) => {

    // https://fkhadra.github.io/react-toastify/replace-default-transition/

    const dispatch = useDispatch();

    const somethingChange = useSelector(selectCurrentList).somethingChange;
    const show = useSelector(selectCurrentMessage).show;
    const message = useSelector(selectCurrentMessage).message;

    const currentTaoEvaluateId = useSelector(selectCurrentMessage).currentTaoEvaluateId;
    const currentTaoInferenceId = useSelector(selectCurrentMessage).currentTaoInferenceId;
    const currentTaoExportId = useSelector(selectCurrentMessage).currentTaoExportId;
    


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

    //const currentTaoExportId = useSelector(selectCurrentMessage).currentTaoExportId;

    const doAction = async (myApi: string, myModelId: string,myType: number) => {

        if (myType === 0) {
            dispatch(setCurrentTaoEvaluateId(myModelId));
        }
        if (myType === 1) {
            dispatch(setCurrentTaoInferenceId(myModelId));
        }
        if (myType === 2) {

            //console.log(`(1) currentTaoExportId:${currentTaoExportId}`);
            //console.log(`(2) myModelId         :${myModelId}`);

            //if (currentTaoExportId===myModelId) return;

            dispatch(setCurrentTaoExportId(myModelId));
        }


        try {

            console.log(`do action ${myApi}:${myModelId}`);

            const res = await fetch(myApi, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "tao_model_uuid": myModelId }),
            });

            const data = await res.json();

            if (data.detail) {
                console.log(data.detail);
                return;
            }

            console.log(`Success do action ${myApi}:${myModelId}`);

        } catch (error) {
            console.log(error);
        }

        // if (myType === 0) {
        //     dispatch(setCurrentTaoEvaluateId(''));
        // }
        // if (myType === 1) {
        //     dispatch(setCurrentTaoInferenceId(''));
        // }
        // if (myType === 2) {
        //     dispatch(setCurrentTaoExportId(''));
        // }

    }


    const autoInference = async () => {
        console.log('auto inference')

        try {

            const res1 = await fetch(taoWorkspaceAPI, {
                method: 'GET'
            });
            const data = await res1.json();

            if (data.detail) {
                console.log(data.detail);
                return;
            }

            //console.log('---row data---')
            //console.log(data);

            if (data.length > 0) {
                //const theLast = data[data.length - 1];
                const mySortList=orderBy(data, ['create_time'],['desc']);


                //console.log('---sort data---')
                //console.log(mySortList);

                const theLast = mySortList[0];
                const myModelId = theLast.tao_model_uuid;
                const theStatus = theLast.tao_model_status;

                console.log('---the check status---')
                //console.log(theStatus)
                console.log('train='+theStatus.train.status[0])
                console.log('evaluate='+theStatus.evaluate.status[0])
                console.log('inference='+theStatus.inference.status[0])
                console.log('export='+theStatus.export.status[0])

                if (!theStatus.train.status[0]) return;

               

                if (!theStatus.evaluate.status[0]) {

                    await doAction(taoEvaluateAPI, myModelId, 0);
                    //await doAction(taoInferenceAPI, myModelId, 1);
                    //await doAction(taoExportAPI, myModelId, 2);
                    return;
                }
                dispatch(setCurrentTaoEvaluateId(''));

                if (!theStatus.inference.status[0]) {

                  
                    //await doAction(taoInferenceAPI, myModelId,1);
                    //if (currentTaoInferenceId===myModelId) return;
                    await doAction(taoInferenceAPI, myModelId, 1);
                    
                    return;
                }
                dispatch(setCurrentTaoInferenceId(''));

                if (!theStatus.export.status[0]) {
                    //if (currentTaoExportId===myModelId) return;
                    await doAction(taoExportAPI, myModelId,2);

                }else{
                    dispatch(setCurrentTaoExportId(''));
                }
                
            }


        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {

        if (show)
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

                closeOnClick: true,
                position: "bottom-center",
                pauseOnHover: true,
                draggable: false,
                theme: "light",

            });
        dispatch(setShow(false));
        dispatch(setMessage(''));

    }, [show]);

    useEffect(() => {


        // dispatch(setCurrentTaoEvaluateId(''));
        // dispatch(setCurrentTaoInferenceId(''));
        // dispatch(setCurrentTaoExportId(''));


        autoInference();

        const interval = setInterval(async () => {
            autoInference();
        }, 10000);

        return () => clearInterval(interval);


    }, []);

    // useEffect(() => {


    //  console.log(`currentTaoExportId:${currentTaoExportId}`);


    // }, [currentTaoExportId]);




    return (
        <>
            {/* <ToastContainer
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
                transition={Slide}

            /> */}
            {/* <div style={{backgroundColor:'yellow'}} className='d-flex flex-row justify-content-center'>
                <div className="header"> */}


            <div className='header-container'>
                <div className="header">
                    {/* <div className="header-text" onClick={() => window.location.reload()}> */}
                    <div className='d-flex flex-row justify-content-between' style={{ width: '100%' }}>
                        <div className="header-text" onClick={handleWindowReload}>
                            <Tooltip enterDelay={500} enterNextDelay={500} title="Home" arrow>
                                <div className="flex-row-center gap-1">
                                    {/* <img src={logo} alt="logo icon" style={{ width: 32, height: 32 }} /> */}
                                    <img src={LogoIcon} width={32} height={32} />
                                    {/* <FontAwesomeIcon icon={faScrewdriverWrench} size="sm" color="#fff" /> */}
                                    <div style={{ fontSize: 35, fontWeight: 500 }}>iVIT.AOI</div>
                                </div>
                            </Tooltip>
                        </div>
                        <div className='d-flex align-items-center'>

                            <CustomButton name="function" text="Project" onClick={() => props.setPageKey('ProjectPage')}
                                focus={(
                                    (props.pageKey === 'ProjectPage') || (props.pageKey === 'ChooseProductPage') ||
                                    (props.pageKey === 'LoadingCopyToLocalPage') || (props.pageKey === 'ExportProductPage') ||
                                    (props.pageKey === 'SetAttributePage') || (props.pageKey === 'LoadingPanelDatasetZipPage')
                                )}
                            />
                            <CustomButton name="function" text="Train" onClick={() => props.setPageKey('TrainPage')}
                                focus={(props.pageKey === 'TrainPage')}
                            />
                            <CustomButton name="function" text="Device" onClick={() => props.setPageKey('ServerPage')}
                                focus={(props.pageKey === 'ServerPage')}
                            />
                            <CustomButton name="function" text="Task" onClick={() => props.setPageKey('InferPage')}
                                focus={(props.pageKey === 'InferPage')}
                            />


                        </div>
                    </div>
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
