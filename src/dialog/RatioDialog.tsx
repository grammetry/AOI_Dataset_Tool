import { ChangeEvent, Dispatch, MouseEventHandler, SetStateAction } from 'react';
import { Button, Dialog, ThemeProvider } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CustomButton from '../components/Buttons/CustomButton';


import { theme } from '../page/ProjectPage';

const useStyles = makeStyles()(() => ({
  customDialog: {
    '.MuiPaper-root': {
      width: '50%',
      height: '60%',
      maxWidth: 600,
      maxHeight: 360,
      backgroundColor: '#FFFCF9',
      borderRadius: 12,
    },
  },
}));

type RatioDialogProps = {
  openRatioDialog: boolean;
  setOpenRatioDialog: Dispatch<SetStateAction<boolean>>;
  trainPass: number;
  setTrainPass: Dispatch<SetStateAction<number>>;
  trainNg: number;
  setTrainNg: Dispatch<SetStateAction<number>>;
  valPass: number;
  setValPass: Dispatch<SetStateAction<number>>;
  valNg: number;
  setValNg: Dispatch<SetStateAction<number>>;
  adjustRatio: MouseEventHandler<HTMLButtonElement>;
};

const RatioDialog = (props: RatioDialogProps) => {
  const {
    openRatioDialog,
    setOpenRatioDialog,
    trainPass,
    setTrainPass,
    trainNg,
    setTrainNg,
    valPass,
    setValPass,
    valNg,
    setValNg,
    adjustRatio,
  } = props;
  const { classes, cx } = useStyles();

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
        open={openRatioDialog}
        className={cx(classes.customDialog)}
        onClose={() => {
          setOpenRatioDialog(false);
        }}
      >
        <div className="dialog-container">
          <div className="title-style">Ratio distribution</div>
          <form onSubmit={() => { }}>
            <div className="dialog-content">
              <div className="dialog-text">
                <div className="border-div-container">
                  <div className="border-div">
                    <div className='my-border-title'>PASS</div>
                    <div className="distribution-input">
                      <div className="input-name">train:</div>
                      <input
                        className='my-ratio-input'
                        type="number"
                        step="1"
                        value={String(trainPass).replace(/^0+(?=\d)/, '')}
                        onChange={(e) => handleChange(e, setTrainPass, setValPass)}
                      />


                      %
                    </div>
                    <div className="distribution-input">
                      <div className="input-name">val:</div>
                      <input
                        className='my-ratio-input'
                        type="number"
                        step="1"
                        value={String(valPass).replace(/^0+(?=\d)/, '')}
                        onChange={(e) => handleChange(e, setValPass, setTrainPass)}
                      />
                      %
                    </div>
                  </div>
                  <div className="border-div">
                    <div className='my-border-title'>NG</div>
                    <div className="distribution-input">
                      <div className="input-name">train:</div>
                      <input
                        className='my-ratio-input'
                        type="number"
                        step="1"
                        value={String(trainNg).replace(/^0+(?=\d)/, '')}
                        onChange={(e) => handleChange(e, setTrainNg, setValNg)}
                      />
                      %
                    </div>
                    <div className="distribution-input">
                      <div className="input-name">val:</div>
                      <input
                        className='my-ratio-input'
                        type="number"
                        step="1"
                        value={String(valNg).replace(/^0+(?=\d)/, '')}
                        onChange={(e) => handleChange(e, setValNg, setTrainNg)}
                      />
                      %
                    </div>
                  </div>
                </div>
              </div>
              <div className="lower-right-button-container">
                
                <CustomButton name='cancel' text='Cancel' width={100} onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                  e.preventDefault();
                  setOpenRatioDialog(false);
                }}></CustomButton>
                <CustomButton name='view' text='OK' width={100} onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                  adjustRatio(e);
                  setOpenRatioDialog(false);
                }}></CustomButton>
              </div>
            </div>
          </form>
        </div>
      </Dialog>
    </ThemeProvider>
  );
};

export default RatioDialog;
