import React, { useRef, useState, useEffect } from 'react';
import Tooltip from '@mui/joy/Tooltip';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Chip from '@mui/joy/Chip';
import { extendTheme } from '@mui/joy/styles';
import { ThemeProvider } from '@mui/joy/styles';

const CustomTooltip = ({ children, title }) => {

    const theme = extendTheme({
        components: {
            JoyModalDialog: {
                defaultProps: { layout: 'center' },
                styleOverrides: {
                    root: ({ ownerState }) => ({
                        ...(ownerState.layout === 'center' && {

                            width: '400px',
                            height: '300px',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            border: '1px solid #E0E1E6',
                            boxShadow: '0px 0px 4px #CACBD733',
                            padding: '40px',
                            fontFamily: 'Roboto',
                        }),
                    }),
                },
            },
        },

        colorSchemes: {
            light: {
                palette: {
                    danger: {


                        outlinedBorder: '#ed1b23', // outlined Border
                        outlinedColor: '#ed1b23', // text color
                        outlinedActiveBg: '#ed1b2333', // background color

                        plainColor: '#00ff00',
                        plainActiveBg: '#00ff00',
                    },
                },
            },

        }
    });

    return (
        <ThemeProvider theme={theme}>

            <Tooltip
                title={
                    <Box sx={{ display: 'flex', gap: 1, width: '100%', mt: 0, backgroundColor: 'transparent',padding:'8px 5px 5px 5px'}}>

                        <Chip color="var(--base_2)" sx={{ ml: 0, mt: 0, fontSize: '15px', padding: 0, backgroundColor: 'transparent', color: 'white', whiteSpace: 'pre-line' }}>
                            {title}
                        </Chip>

                    </Box>

                }
                arrow
                placement="top"
                slotProps={{
                    root: {
                        sx: {
                            backgroundColor: '#16272E99',
                            padding: '0px 10px 2px 10px',
                            borderRadius: 6,

                        },
                    },
                }}
            >
                {children}
            </Tooltip>
        </ThemeProvider>

    );
};

export default CustomTooltip;