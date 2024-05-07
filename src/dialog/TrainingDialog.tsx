import { ChangeEvent, Dispatch, MouseEventHandler, SetStateAction, useState, useRef } from 'react';
import { Button, Dialog, ThemeProvider } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { theme } from '../page/ProjectPage';
import { OptionType } from '../page/type';
import TrainMethodSelector, { TrainMethodSelectorRef } from '../components/Dropdowns/TrainMethodSelector';

const useStyles = makeStyles()(() => ({
    customDialog: {
        borderRadius: 4,
        '.MuiPaper-root': {
            width: '50%',
            height: '60%',
            maxWidth: 500,
            maxHeight: 560,
            backgroundColor: '#FFFCF9',
        },
    },
}));

type TrainingDialogProps = {
    openTrainingDialog: boolean;
    setOpenTrainingDialog: Dispatch<SetStateAction<boolean>>;
};





const TrainingDialog = (props: TrainingDialogProps) => {
    const {
        openTrainingDialog,
        setOpenTrainingDialog,
    } = props;
    const { classes, cx } = useStyles();

    const [openParameter, setOpenParameter] = useState(false);

    const [trainMethodOption, setTrainMethodOption] = useState<OptionType[]>([{ value: '1', label: 'Quick Train' }, { value: '2', label: 'Advance Train' }]);

    const trainMethodSelectorRef = useRef<TrainMethodSelectorRef>(null);

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
                                    onChange={(item: OptionType | null) => { console.log(item); if (item?.value === '1') { setOpenParameter(false); } else { setOpenParameter(true); } }}
                                    className="my-train-method-select"
                                    ref={trainMethodSelectorRef}
                                    defaultOption={trainMethodOption[0]}
                                />


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
                                    type="submit"
                                    variant="contained"
                                    className="enlarge-button"
                                    sx={{ width: 100, fontSize: 16, padding: '2px 6px', textTransform: 'none', transition: 'transform 0.2s' }}
                                    onClick={(e) => {
                                        
                                        setOpenTrainingDialog(false);
                                    }}
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
