import React, { useState, useRef, useEffect } from 'react';
import log from "../../utils/console";
import useWebSocket, { ReadyState } from 'react-use-websocket';

import { inferTaskInfoAPI } from '../../APIPath';

const CustomWebSocket = (props) => {

    const { currentServer,onSocketMessage } = props;

    const wsProtocol = window.location.protocol === "http:" ? 'ws:' : 'wss:';


    const [socketUrl, setSocketUrl] = useState('');
    const [messageHistory, setMessageHistory] = useState([]);
    const { lastMessage, readyState, sendMessage } = useWebSocket(`${socketUrl}`, {
           
            onOpen: () => {
                log('--- web socket open ---')
            },
            shouldReconnect: (closeEvent) => true,
        }
        //{ headers: { "X-IP-Host": "172.16.92.129:81" }}
    );

    const didUnmount = useRef(false);

    useEffect(() => {

        if (lastMessage !== null) {

            //console.log('lastMessage', lastMessage);
            onSocketMessage(lastMessage);

        }
    }, [lastMessage]);


    useEffect(() => {

        //console.log('currentServer', currentServer);

        let myUrl=inferTaskInfoAPI;
        if (process.env.REACT_APP_API_URL !== '') {
            // dev mode
            myUrl = `ws://${currentServer}${inferTaskInfoAPI}`;
        } else {
            // production mode
            myUrl = `ws://${window.location.host}/websocket${inferTaskInfoAPI}?ip=${currentServer}`;
        }

        console.log('myUrl', myUrl);

        setSocketUrl(myUrl);

    }, [currentServer]);


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
        <div className="my-body-title roboto-h2" style={{ width: 500, height: 36, letterSpacing: 'normal',position:'absolute',top:5,left:5,color:'#E61F23' }}>
            {connectionStatus}
        </div>
    );
};

export default CustomWebSocket;