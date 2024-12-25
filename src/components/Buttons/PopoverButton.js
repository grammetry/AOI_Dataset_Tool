import React, { useEffect } from 'react';
import { filter, toArray, findIndex, isEqual, map, cloneDeep, sortBy, orderBy, take, slice, uniqBy } from 'lodash-es';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import '../../page/page.scss';


import { Button, createTheme, Menu, MenuItem, ThemeProvider, Tooltip } from '@mui/material';


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
        fontFamily: 'Roboto',
    },
    shape: {    
        borderRadius: 16
    }

});

const theme4 = createTheme({
    components: {
        
        MuiButton: {
            styleOverrides: {
                // Name of the slot
                root: {
                    // Some CSS
                    fontSize: '1rem',
                    borderRadius: 3,
                },
            },
        },
    },
});




export default function PopoverButton(props) {

    const [anchorEl, setAnchorEl] = React.useState(null);

    const rootElement = document.getElementById("root");

    // const theme4 = createTheme({
    //     components: {
    //         MuiPopover: {
    //             defaultProps: {
    //                 container: rootElement,
    //             },
    //         },
    //         MuiPopper: {
    //             defaultProps: {
    //                 container: rootElement,
    //             },
    //         },
    //         MuiDialog: {
    //             defaultProps: {
    //                 container: rootElement,
    //             },
    //         },
    //         MuiModal: {
    //             defaultProps: {
    //                 container: rootElement,
    //             },
    //         },
    //         MuiButton: {
    //             styleOverrides: {
    //                 // Name of the slot
    //                 root: {
    //                     // Some CSS
    //                     fontSize: '1rem',
    //                     borderRadius: 3,
    //                 },
    //             },
    //         },
    //     },
    // });

    // const theme2 = createTheme({
    //     components: {
    //         // Name of the component
    //         MuiButton: {
    //             defaultProps: {
    //                 container: rootElement,
    //             },
    //             styleOverrides: {
    //                 // Name of the slot
    //                 root: {
    //                     // Some CSS
    //                     fontSize: '1rem',
    //                     borderRadius: 3,
    //                 },
    //                 shape: {
    //                     borderRadius: 16
    //                 }
    //             },
    //             shape: {
    //                 borderRadius: 16
    //             }
    //         },
    //     },
    // });

    // const theme3 = createTheme({
    //     components: {
    //         MuiButton: {

    //             styleOverrides: {
    //                 root: ({ ownerState }) => ({
    //                     ...(ownerState.variant === 'outlined' && {
    //                         color: 'black',
    //                         width: '1px',
    //                         opacity: 1,
    //                         borderRadius: 16
    //                     }),
    //                 }),
    //             },
    //         },
    //     },
    // });

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;



    return (

        <ThemeProvider theme={theme}>
            <Button aria-describedby={id} onClick={handleClick} variant="contained">
                Open Popover
            </Button>


            {/* <Button
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
               
            >
                Train Page
            </Button>
 */}

            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <Typography sx={{ p: 2 }}>The content of the Popover.</Typography>
            </Popover>
        </ThemeProvider>

    );
}