import { Dispatch, FormEventHandler, SetStateAction, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Dialog, ThemeProvider } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import CustomInput, { CustomInputRef } from '../components/Inputs/CustomInput';
import CustomButton from '../components/Buttons/CustomButton';

import { setMessage, setShow } from '../redux/store/slice/currentMessage';

import { datasetToolProjectAPI } from '../APIPath';
import Required from '../components/Required';
import { theme } from '../page/ProjectPage';

import { ProjectDataType } from '../page/type';
import { set } from 'lodash';
import { ToastContainer, toast, cssTransition, Slide } from 'react-toastify';

const useStyles = makeStyles()(() => ({
    customDialog: {
        '.MuiPaper-root': {
            width: '50%',
            height: '60%',
            maxWidth: 600,
            maxHeight: 500,
            backgroundColor: '#FFFCF9',
            borderRadius: 10,
            padding: '0px 0px',
        },
    },
}));

type UpsertProjectDialogProps = {
    openUpsertDialog: '' | 'add' | 'edit';
    setOpenUpsertDialog: Dispatch<SetStateAction<'' | 'add' | 'edit'>>;
    fetchProject: (projectId: string) => void;
    currentProject?: ProjectDataType;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
};

const UpsertProjectDialog = (props: UpsertProjectDialogProps) => {

    const { openUpsertDialog, setOpenUpsertDialog, fetchProject, currentProject, setIsLoading } = props;
    const { classes, cx } = useStyles();

    const [projectNoteWarning, setProjectNoteWarning] = useState(false);

    const projectNameInputRef = useRef<CustomInputRef>(null);
    const projectNoteInputRef = useRef<HTMLTextAreaElement>(null);

    const dispatch = useDispatch();

    const setMessage=(message:string)=>{
        toast(message, {
            style: {
                backgroundColor: '#16272E',
                width: 800,
                height: 44,
                fontSize:'16px',
                minHeight: 44,
                color: 'white',
                left:-250,
                paddingLeft: 200
            },
           
            closeOnClick: true,
            position: "bottom-center",
            pauseOnHover: true,
            draggable: false,
            theme: "light",
          
        });
    }


    //const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    const handleSubmit = () => {

        console.log('handle submit')

        //const myNote=projectNoteInputRef.current?.value?.trim() || '';

        const myNote=projectNoteInputRef.current?.value || '';

       
        const postData = {
            project_uuid: currentProject?.project_uuid || '',
            project_name: (projectNameInputRef.current?.getInputValue() as string).trim(),
            annotation: myNote,
            //annotation: (formData.get('note') as string).replace(/[&\/\#, +()~%.'":@^*?<>{}]/g, '').trim() || null,
        };

        console.log('submit')

        let checkPass=true;

        if (/[^a-zA-Z0-9_.\s\-/\u4E00-\u9FFF]+/.test(postData.project_name)) {

            setMessage('Project name input only english letter, numerical digits, _  , .  , space, and chinese characters.');
            projectNameInputRef.current?.setWarnning(true);
            checkPass=false;

        }


        if (postData.annotation) {
            if (/[|\\'\"\=%\*\?\@\$\+\^&><!#]+/.test(postData.annotation)) {

                setMessage('Note input not accept \ | \' " = % * ? @ $ + ^ & > < ! # characters.');
                setProjectNoteWarning(true);
                checkPass=false;

            }
        }


        if (postData.project_name === '') {         
            setMessage('Please input the project name.');
            projectNameInputRef.current?.setWarnning(true);
            checkPass=false;
        } 


        if (!checkPass) {
            return;
        }

        setIsLoading(true);

        fetch(datasetToolProjectAPI, {
            method: openUpsertDialog === 'add' ? 'POST' : 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        })
            .then((res) => {
                if (!res.ok) {
                    return res.json().then((data) => {
                        throw { error: 'API request failed', response: data };
                    });
                } else {
                    setOpenUpsertDialog('');
                    return fetchProject(currentProject?.project_uuid || '');
                }

            })
            .catch((err) => {
                const msg = err?.response?.detail?.[0]?.msg || '';
                const loc = err?.response?.detail?.[0]?.loc || [];
                console.log(`API error: ${msg} [${loc.join(', ')}]`);
                //alert('api error')
                
                setMessage(msg);

            })
            .finally(() => {
                //
                setIsLoading(false);
            });
    };

    const handleClose = () => {
        setOpenUpsertDialog('');
    };

    if (!openUpsertDialog) return <></>;

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
                transition={Slide}

            />
            <ThemeProvider theme={theme}>
                <Dialog open={!!openUpsertDialog} className={cx(classes.customDialog)} onClose={handleClose}>
                    <div className="dialog-container">
                        <h4>{currentProject?.project_uuid ? 'Edit Project' : 'Add Project'}</h4>
                        <div>
                            <div className="dialog-content">
                                <div style={{ marginBottom: '10px' }}>
                                    <div className="my-input-title">
                                        Project name
                                        <Required />
                                    </div>
                                    <CustomInput onChange={(myValue: string) => console.log(myValue)} defaultValue={currentProject?.project_name || ''} autoComplete="off" ref={projectNameInputRef} height={40} />
                                </div>
                                <div className="my-input-title">Note</div>
                                <textarea className={(projectNoteWarning)?"my-text-area-warning":"my-text-area"} name="note" 
                                    rows={8} defaultValue={currentProject?.annotation || ''} ref={projectNoteInputRef}
                                    onFocus={() => setProjectNoteWarning(false)}
                                />
                                
                            </div>
                            <div className="lower-right-button-container mt-2">
                               
                                <CustomButton name="cancel" text="Cancel" width={100} onClick={() => setOpenUpsertDialog('')}></CustomButton>
                                <CustomButton name="view" text="Save" width={100} onClick={()=>handleSubmit()}></CustomButton>
                            </div>
                        </div>
                    </div>
                </Dialog>
            </ThemeProvider>
        </>
    );
};

export default UpsertProjectDialog;
