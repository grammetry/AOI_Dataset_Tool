import { Dispatch, FormEventHandler, SetStateAction } from 'react';
import { Button, Dialog, ThemeProvider } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { datasetToolProjectAPI } from '../APIPath';
import Required from '../components/Required';
import { theme } from '../page/ProjectPage';

import { ProjectDataType } from '../page/type';

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

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const postData = {
      project_uuid: currentProject?.project_uuid || '',
      project_name: (formData.get('name') as string).trim(),
      annotation: (formData.get('note') as string).trim() || null,
    };
    if (!postData.project_name) return alert('Please input the project name.');
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
          return fetchProject(currentProject?.project_uuid || '');
        }
      })
      .catch((err) => {
        const msg = err?.response?.detail?.[0]?.msg || '';
        const loc = err?.response?.detail?.[0]?.loc || [];
        console.log(`API error: ${msg} [${loc.join(', ')}]`);
      })
      .finally(() => {
        setOpenUpsertDialog('');
        setIsLoading(false);
      });
  };

  const handleClose = () => {
    setOpenUpsertDialog('');
  };

  if (!openUpsertDialog) return <></>;

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={!!openUpsertDialog} className={cx(classes.customDialog)} onClose={handleClose}>
        <div className="dialog-container">
          <div className="title-style">{currentProject?.project_uuid ? 'Edit Project' : 'Add Project'}</div>
          <form onSubmit={handleSubmit}>
            <div className="dialog-content">
              <div style={{ marginBottom: '10px' }}>
                <div className="input-name">
                  Project name
                  <Required />
                </div>
                <input name="name" defaultValue={currentProject?.project_name || ''} />
              </div>
              <div className="input-name">Note</div>
              <textarea name="note" defaultValue={currentProject?.annotation || ''} />
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
                onClick={() => setOpenUpsertDialog('')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                className="enlarge-button"
                sx={{ width: 100, fontSize: 16, padding: '2px 6px', textTransform: 'none', transition: 'transform 0.2s' }}
              >
                Save
              </Button>
            </div>
          </form>
        </div>
      </Dialog>
    </ThemeProvider>
  );
};

export default UpsertProjectDialog;
