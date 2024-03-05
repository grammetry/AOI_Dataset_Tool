import { Dispatch, SetStateAction } from 'react';
import { Dialog } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { panelSourceViewAPI } from '../APIPath';

const useStyles = makeStyles()(() => ({
  customDialog: {
    borderRadius: 4,
    '.MuiPaper-root': {
      width: 800,
      height: 600,
      maxWidth: '90%',
      maxHeight: '90%',
      backgroundColor: '#FFFCF9',
    },
  },
}));

type ChartDialogProps = {
  openChartDialog: boolean;
  setOpenChartDialog: Dispatch<SetStateAction<boolean>>;
};

const ChartDialog = (props: ChartDialogProps) => {
  const { openChartDialog, setOpenChartDialog } = props;
  const { classes, cx } = useStyles();

  const fetchImage = (datasetIdParams: string, sourceId: string) => {
    if (!(datasetIdParams && sourceId)) return;
    fetch(panelSourceViewAPI(datasetIdParams, sourceId))
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw { error: 'API request failed', response: data };
          });
        } else {
          return res.json();
        }
      })
      .then((data) => {})
      .catch((err) => {
        const msg = err?.response?.detail?.[0]?.msg || '';
        const loc = err?.response?.detail?.[0]?.loc || [];
        console.log(`API error: ${msg} [${loc.join(', ')}]`);
      });
  };

  return (
    <Dialog
      open={openChartDialog}
      className={cx(classes.customDialog)}
      onClose={() => {
        setOpenChartDialog(false);
      }}
    >
      123
    </Dialog>
  );
};

export default ChartDialog;
