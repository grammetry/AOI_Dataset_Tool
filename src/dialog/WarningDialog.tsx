import { Dispatch, FormEventHandler, SetStateAction } from 'react';
import { Button, Dialog, ThemeProvider } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { theme } from '../page/ProjectPage';
import { AttributeType } from '../page/type';

const useStyles = makeStyles()(() => ({
  customDialog: {
    borderRadius: 4,
    '.MuiPaper-root': {
      width: '50%',
      height: '60%',
      maxWidth: 500,
      maxHeight: 360,
      backgroundColor: '#FFFCF9',
    },
  },
}));

type WarningDialogProps = {
    openWarningDialog: boolean;
    setOpenWarningDialog: Dispatch<SetStateAction<boolean>>;
    warningAttribute: AttributeType;
};

const WarningDialog = (props: WarningDialogProps) => {
  const { openWarningDialog, setOpenWarningDialog, warningAttribute} = props;
  const { classes, cx } = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={openWarningDialog} className={cx(classes.customDialog)} onClose={() => setOpenWarningDialog(false)}>
        <div className="dialog-container">
          <div className="title-style">{warningAttribute.title}</div>
          
            <div className="dialog-content">
              <div className="dialog-text" dangerouslySetInnerHTML={{ __html: warningAttribute.desc }} />
              <div className="lower-right-button-container">
                <Button
                  type="submit"
                  variant="contained"
                  className="enlarge-button"
                  sx={{ width: 100, fontSize: 16, padding: '2px 6px', textTransform: 'none', transition: 'transform 0.2s' }}
                  onClick={() => setOpenWarningDialog(false)}
                >
                  OK
                </Button>
              </div>
            </div>
          
        </div>
      </Dialog>
    </ThemeProvider>
  );
};

export default WarningDialog;
