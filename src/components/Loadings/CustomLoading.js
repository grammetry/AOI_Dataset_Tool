import React, { Dispatch, FormEventHandler, SetStateAction } from 'react';
import { Dialog, ThemeProvider } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { theme } from '../../page/ProjectPage';
import { ProgressType } from '../../page/type';
import { CssVarsProvider } from '@mui/joy/styles';

import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import CircularProgress from '@mui/joy/CircularProgress';



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


const CustomLoading = (props) => {
    const { openProgressDialog, setOpenProgressDialog, progressAttribute } = props;
    const { classes, cx } = useStyles();

    return (
        <ThemeProvider theme={theme}>
            <Dialog open={openProgressDialog} className={cx(classes.customDialog)} >
                <div className="dialog-container justify-content-center align-items-center mt-4">
                    <div className="title-style">&nbsp;</div>
                    <div className="dialog-content mt-1">
                        <CssVarsProvider>
                            <Stack direction="row" alignItems="center" flexWrap="wrap" spacing={8}>

                                <Stack spacing={2}>
                                    <CircularProgress size="lg" color='danger' variant="solid"
                                        sx={{
                                            "--CircularProgress-size": "150px",
                                            "--CircularProgress-trackThickness": "15px",
                                            "--CircularProgress-progressThickness": "15px",
                                            "--CircularProgress-trackColor": "#ed1b2333",
                                            "--CircularProgress-progressColor": "#ed1b23",
                                        
                                           
                                        }}
                                    >
                                        <Typography  level="h4">Processing</Typography>
                                    </CircularProgress>

                                </Stack>
                            </Stack>
                        </CssVarsProvider>
                    </div>

                </div>
            </Dialog>
        </ThemeProvider>
    );
};

export default CustomLoading;
