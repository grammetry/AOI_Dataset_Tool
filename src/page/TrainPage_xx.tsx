
import { Dispatch, FormEventHandler, MouseEvent, SetStateAction, useEffect, useState } from 'react';
import './page.scss';
import { Button, createTheme, Menu, MenuItem, ThemeProvider, Tooltip } from '@mui/material';
import { AttributeType, PageKeyType, ProjectDataType } from './type';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#ed1b23',
    },
    secondary: {
      main: '#888',
    },
  },
  typography: {
    fontFamily: 'Google Noto Sans TC',
  },
});

type TrainPageProps = {
  currentProject: ProjectDataType;
  setPageKey: Dispatch<SetStateAction<PageKeyType>>;
  };

const TrainPage = (props: TrainPageProps) => {
  
    const { setPageKey, currentProject } = props;

  return (
    <ThemeProvider theme={theme}>
    <div className="container">
        <div className="title-container first-title-container">
          <div className="title-style">Train Page</div>
         
        </div>
        <div className="project-wrapper">
          content
        </div>
    </div>
  </ThemeProvider>
  );
}   

export default TrainPage;