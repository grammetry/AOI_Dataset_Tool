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

type ConfirmDialogProps = {
  openConfirmDialog: boolean;
  setOpenConfirmDialog: Dispatch<SetStateAction<boolean>>;
  handleConfirm: FormEventHandler<HTMLFormElement>;
  confirmAttribute: AttributeType;
};

const ConfirmDialog = (props: ConfirmDialogProps) => {
  const { openConfirmDialog, setOpenConfirmDialog, handleConfirm, confirmAttribute } = props;
  const { classes, cx } = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={openConfirmDialog} className={cx(classes.customDialog)} onClose={() => setOpenConfirmDialog(false)}>
        <div className="dialog-container">
          <div className="title-style">{confirmAttribute.title}</div>
          <form onSubmit={handleConfirm}>
            <div className="dialog-content">
              <div className="dialog-text" dangerouslySetInnerHTML={{ __html: confirmAttribute.desc }} />
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
                  onClick={() => setOpenConfirmDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  className="enlarge-button"
                  sx={{ width: 100, fontSize: 16, padding: '2px 6px', textTransform: 'none', transition: 'transform 0.2s' }}
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

export default ConfirmDialog;
