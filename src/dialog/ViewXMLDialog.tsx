import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Button, Dialog, ThemeProvider } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { datasetImgAPI, panelSourceViewAPI } from '../APIPath';
import { theme } from '../page/ProjectPage';

import { openImgInNewTab } from '../utils';

import { XMLDataType } from '../page/type';

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

type ViewXMLDialogProps = {
  datasetId: string;
  openViewDialog: string;
  setOpenViewDialog: Dispatch<SetStateAction<string>>;
};

const ViewXMLDialog = (props: ViewXMLDialogProps) => {
  const { datasetId, openViewDialog, setOpenViewDialog } = props;
  const [imgData, setImgData] = useState<XMLDataType>();
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
      .then((data) => {
        setImgData(data);
      })
      .catch((err) => {
        const msg = err?.response?.detail?.[0]?.msg || '';
        const loc = err?.response?.detail?.[0]?.loc || [];
        console.log(`API error: ${msg} [${loc.join(', ')}]`);
      });
  };

  useEffect(() => {
    fetchImage(datasetId, openViewDialog);
  }, [datasetId, openViewDialog]);

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={!!openViewDialog}
        className={cx(classes.customDialog)}
        onClose={() => {
          setOpenViewDialog('');
          setImgData(undefined);
        }}
      >
        {imgData && (
          <div className="view-XML-dialog">
            <div className="XML-img-container">
              {Array(imgData.total)
                .fill(null)
                .map((_, index) => index + 1)
                .map((board) => (
                  <div className="XML-img-wrapper">
                    {!!imgData.board &&
                      imgData.board[board] &&
                      imgData.board[board].map((img) => (
                        <div key={img} className="XML-img">
                          <img src={datasetImgAPI(img, 128)} onClick={() => openImgInNewTab(datasetImgAPI(img))} alt="board img" />
                        </div>
                      ))}
                  </div>
                ))}
            </div>
            ※Click to check full size image.
            <div className="lower-right-button-container">
              <Button
                variant="outlined"
                className="enlarge-button"
                style={{
                  width: 100,
                  fontSize: 16,
                  padding: '2px 6px',
                  textTransform: 'none',
                  boxShadow: '0px 2px 2px 0px #00000010',
                  transition: 'transform 0.2s',
                }}
                onClick={() => {
                  setOpenViewDialog('');
                  setImgData(undefined);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </ThemeProvider>
  );
};

export default ViewXMLDialog;
