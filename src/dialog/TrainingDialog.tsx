import { ChangeEvent, Dispatch, MouseEventHandler, SetStateAction, useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Dialog, ThemeProvider } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { theme } from '../page/ProjectPage';
import { OptionType,TaoQuickTrainType,TaoStartTrainType } from '../page/type';
import TrainMethodSelector, { TrainMethodSelectorRef } from '../components/Dropdowns/TrainMethodSelector';
import { setShow, setMessage } from '../redux/store/slice/currentMessage';
import { WorkspaceType, PageKeyType } from '../page/type';

import { taoWorkspaceAPI,taoQuickTrainAPI,taoStartTrainAPI } from '../APIPath';

const useStyles = makeStyles()(() => ({
    customDialog: {
        borderRadius: 4,
        '.MuiPaper-root': {
            width: '50%',
            height: '70%',
            maxWidth: 500,
            minHeight: 560,
            backgroundColor: '#FFFCF9',
        },
    },
}));

type TrainingDialogProps = {
    openTrainingDialog: boolean;
    setOpenTrainingDialog: Dispatch<SetStateAction<boolean>>;
    setPageKey: Dispatch<SetStateAction<PageKeyType>>;
};





const TrainingDialog = (props: TrainingDialogProps) => {
    const {
        openTrainingDialog,
        setOpenTrainingDialog,
        setPageKey
    } = props;
    const { classes, cx } = useStyles();

    const dispatch = useDispatch();

    const [openParameter, setOpenParameter] = useState(false);

    const [trainMethodOption, setTrainMethodOption] = useState<OptionType[]>([{ value: '1', label: 'Quick Train' }, { value: '2', label: 'Advance Train' }]);

    const [trainMethod, setTrainMethod] = useState<OptionType|null>({ value: '1', label: 'Quick Train' });

    const trainMethodSelectorRef = useRef<TrainMethodSelectorRef>(null);

    const workspaceNameRef = useRef<HTMLInputElement>(null);
    const selectFileRef = useRef<HTMLInputElement>(null);


    const handleChange = (
        e: ChangeEvent<HTMLInputElement>,
        setState: Dispatch<SetStateAction<number>>,
        oppSetState: Dispatch<SetStateAction<number>>,
    ) => {
        let value = +e.target.value;
        const maxValue = 100;
        const minValue = 0;

        // 檢查是否為數字
        if (!isNaN(Number(value))) {
            value = Math.floor(Number(value)); // 轉換為整數
            // 確保在最小值和最大值範圍內
            value = Math.max(minValue, Math.min(value, maxValue));
        } else {
            value = 0;
        }

        setState(value);
        oppSetState(100 - value);
    };

    const handleTrain = () =>{

       
        console.log('start training...')

        if (workspaceNameRef.current?.value==='' || workspaceNameRef.current?.value===null){
            console.log('workspace name is empty');
            dispatch(setMessage('Workspace name is empty!'));
            dispatch(setShow(true));
            return;
        }

        if (selectFileRef.current?.files?.length === 0) {
            console.log('no file selected');
            dispatch(setMessage('No file selected!'));
            dispatch(setShow(true));
            return;
        }   

        if (workspaceNameRef.current){
            const myData:WorkspaceType={
                project_uuid:null,
                dataset_uuid:null,
                export_uuid:null,
                tao_model_name:workspaceNameRef.current?.value
            };
       
            fetch(taoWorkspaceAPI, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(myData),
            })
            .then((response) => response.json())
            .then((data) => {
                //console.log('Success:', data);

                console.log('Step 1 : success, get tao_model_uuid from server');
               
                if (data.tao_model_uuid){
                    //console.log(data.tao_model_uuid);
                    taoQuickTrain(data.tao_model_uuid);
                }
                else{
                    dispatch(setMessage('tao_model_uuid is empty'));
                    dispatch(setShow(true));
                }
                   
            }).
            catch((err) => {
                const msg = err?.response?.detail?.[0]?.msg || '';
                const loc = err?.response?.detail?.[0]?.loc || [];
                console.log(err);
                dispatch(setMessage(`API error: ${msg} [${loc.join(', ')}]`));
                dispatch(setShow(true));
            });

        }

        //setOpenTrainingDialog(false);

    }

    const taoQuickTrain = (uuid:string) =>{

        if (selectFileRef.current){
            // const myData:TaoQuickTrainType={
            //     tao_model_uuid:uuid,
            //     file:selectFileRef.current.files![0]
            // };

            const myData = new FormData();
            myData.append('tao_model_uuid', uuid);
            myData.append('file', selectFileRef.current.files![0])
         

            fetch(taoQuickTrainAPI, {
                method: 'POST',
                body: myData,
            })
            .then((response) => response.json())
            .then((data) => {
                //console.log('Success:', data);

                console.log('Step 2 : success, upload file to server complete');
               
                if (data.detail){
                    dispatch(setMessage(data.detail));
                    dispatch(setShow(true));
                    return;
                }

                taoStartTrain(uuid);
              
                   
            }).
            catch((err) => {
                const msg = err?.response?.detail?.[0]?.msg || '';
                const loc = err?.response?.detail?.[0]?.loc || [];
                console.log(err);
                dispatch(setMessage(`API error: ${msg} [${loc.join(', ')}]`));
                dispatch(setShow(true));
            });

            //"Content-Type": "multipart/form-data",
        }

       

    }


    const taoStartTrain = (uuid:string)=>{

        const myData:TaoStartTrainType={
            tao_model_uuid:uuid
        };
   
        fetch(taoStartTrainAPI, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(myData),
        })
        .then((response) => response.json())
        .then((data) => {
            console.log('Success:', data);


            console.log('Step 3 : success, redirect to TrainPage');
           
            setPageKey('TrainPage');
               
        }).
        catch((err) => {
            const msg = err?.response?.detail?.[0]?.msg || '';
            const loc = err?.response?.detail?.[0]?.loc || [];
            console.log(err);
            dispatch(setMessage(`API error: ${msg} [${loc.join(', ')}]`));
            dispatch(setShow(true));
        });

    }

    return (
        <ThemeProvider theme={theme}>
            <Dialog
                open={openTrainingDialog}
                className={cx(classes.customDialog)}
                onClose={() => {
                    setOpenTrainingDialog(false);
                }}
            >
                <div className="dialog-container">
                    <div className="title-style">Train</div>
                    <form onSubmit={() => { }}>
                        <div className="dialog-content">
                            <div className="dialog-text">

                                Method of train:
                                <TrainMethodSelector
                                    options={trainMethodOption}
                                    onChange={(item: OptionType|null) => { console.log(item); setTrainMethod(item);if (item?.value === '1') { setOpenParameter(false); } else { setOpenParameter(true); } }}
                                    className="my-train-method-select"
                                    ref={trainMethodSelectorRef}
                                    defaultOption={trainMethod}
                                />

                                <div className="my-train-parameter" style={{marginTop:'15px'}}>
                                    <div className="input-name">tao_model_name:</div> 
                                    <input type="text" className="form-control form-control-lg" width="20px" ref={workspaceNameRef}></input>
                                </div>

                                <div className="my-train-parameter" style={{marginTop:'10px'}}>
                                    <div className="input-name">file:</div> 
                                    <input type="file" className="form-control form-control-lg" width="20px" ref={selectFileRef}></input>
                                </div>

                              

                                {openParameter &&
                                    <div className="my-train-parameter-container">
                                        <div className="my-train-parameter-container-left">
                                            <div className="my-train-parameter">
                                                <div className="input-name">margin:</div>
                                                
                                                <input type="text" className="form-control form-control-lg" width="20px"></input>
                                            </div>
                                            <div className="my-train-parameter">
                                                <div className="input-name">fpration sample:</div>
                                                <input type="text" className="form-control form-control-lg" width="20px"></input>
                                            </div>
                                            <div className="my-train-parameter">
                                                <div className="input-name">learning rate:</div>
                                                <input type="text" className="form-control form-control-lg" width="20px"></input>
                                            </div>
                                        </div>

                                        <div className="my-train-parameter-container-right">
                                            <div className="my-train-parameter">
                                                <div className="input-name">batch size:</div>
                                                <input type="text" className="form-control form-control-lg" width="20px"></input>
                                            </div>
                                            <div className="my-train-parameter">
                                                <div className="input-name">num of epochs:</div>
                                                <input type="text" className="form-control form-control-lg" width="20px"></input>
                                            </div>
                                            <div className="my-train-parameter">
                                                <div className="input-name">check point interval:</div>
                                                <input type="text" className="form-control form-control-lg" width="20px"></input>
                                            </div>
                                        </div>
                                    </div>
                                }





                            </div>
                            <div className="lower-right-button-container">
                                <Button
                                    variant="outlined"
                                    className="enlarge-button"
                                    sx={{
                                        width: 100,
                                        fontSize: 16,
                                        padding: '2px 6px',
                                        textTransform: 'none',
                                        boxShadow: '0px 2px 2px 0px #00000010',
                                        transition: 'transform 0.2s',
                                    }}
                                    onClick={() => setOpenTrainingDialog(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    
                                    variant="contained"
                                    className="enlarge-button"
                                    sx={{ width: 100, fontSize: 16, padding: '2px 6px', textTransform: 'none', transition: 'transform 0.2s' }}
                                    onClick={handleTrain}
                                >
                                    OK
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </Dialog>
        </ThemeProvider>
    );
};

export default TrainingDialog;
