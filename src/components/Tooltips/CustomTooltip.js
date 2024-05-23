import React, { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux";
import Tooltip from '@mui/joy/Tooltip';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Chip from '@mui/joy/Chip';
import { extendTheme, CssVarsProvider } from '@mui/joy/styles';

import { selectCurrentClassInfo } from "../../redux/store/slice/currentClassInfo";

const ClassTooltip = ({ children, title, keyword,expandClassMenu }) => {

    const classInfo = useSelector(selectCurrentClassInfo).classInfo;

    return (
         
            ((classInfo.length===0)&&(!expandClassMenu)) ?
            <Tooltip
            variant="outlined"
            title={
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        maxWidth: 206,
                        justifyContent: 'top',
                        p: 1,
                        minHeight:160,
                    }}
                >
                    <Typography
                        fontSize="18px"
                        fontFamily="roboto"
                        fontWeight="500"
                        textColor="#16272E"

                    >
                        Create class
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, width: '100%', mt: 1 }}>

                        <div>
                            <Typography fontSize="13px" fontFamily="roboto" >
                                Get started by creating your first class.
                            </Typography>

                        </div>
                    </Box>
                </Box>
            }


            arrow
            open
            placement="bottom"
            
            slotProps={{
                root: {
                    sx: {
                        backgroundColor: '#FFD8D9',
                        padding: '10px 16px',
                        borderColor: '#16272E14',
                        borderRadius: 6,
                        offset: [50, 50],
                        top : "5px !important"
                    
                    },
                },
                arrow: {
                    sx: {
                     
                        "&::before": {
                            borderColor: "#FFD8D9", 
                            boxShadow : '2px 2px #16272E14',
                            '--unstable_Tooltip-arrowRotation': -1,
                        },

                    },
                },
            }}
        >
            {children}
             </Tooltip>
            :
            <> {children}</>

    );
};

export default ClassTooltip;