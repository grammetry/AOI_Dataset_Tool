import React, { useState, useRef, useEffect } from 'react';
import log from "../../utils/console";
import useWebSocket, { ReadyState } from 'react-use-websocket';



const TrainWebSocket = (props) => {

    const { url, onSocketMessage } = props;

    
    const [socketUrl, setSocketUrl] = useState('');
    const [messageHistory, setMessageHistory] = useState([]);
    const { lastMessage, readyState, sendMessage } = useWebSocket(url, {
        onOpen: () => {
            log('--- web socket open ---')
        },
        onClose: () => {
            log('--- web socket close ---')
        },
        shouldReconnect: (closeEvent) => {
            log('--- web socket shouldReconnect ---')
            log('--- url ---', url)
            return true;
        
        },
    });

    const didUnmount = useRef(false);

    useEffect(() => {

       
        if (lastMessage){
            onSocketMessage(lastMessage);
        }


    }, [lastMessage]);


    useEffect(() => {
        return () => {
            didUnmount.current = true;
        };
    }, []);
   

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    return (
        <div className="my-body-title roboto-h2" style={{ width: 500, height: 36, letterSpacing: 'normal', position: 'absolute', top: 100, left: 5, color: 'white' }}>
            {connectionStatus}
        </div>
    );
};

export default TrainWebSocket;