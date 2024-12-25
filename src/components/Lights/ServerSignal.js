import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import log from "../../utils/console";
import LightGreenIcon from '../../image/Light_Green.png';
import LightRedIcon from '../../image/Light_Red.png';
import LightGrayIcon from '../../image/Light_Gray.png';
import { inferHealthAPI } from '../../APIPath';

const ServerSignal = forwardRef((props, ref) => {

    const { ip, port } = props;

    const [online, setOnline] = useState(null);
    // const [ip, setIp] = useState('');
    // const [port, setPort] = useState('');

    useImperativeHandle(ref, () => ({


    }));

    const getSignal = async () => {

        // if (ip === '' || port === '') {
        //     setOnline(null);
        //     return;
        // }

        let myOnline = false;
        try {

            let myUrl = inferHealthAPI;
            if (process.env.REACT_APP_API_URL !== '') {
                // dev mode
                myUrl = `http://${ip}:${port}${inferHealthAPI}`;
            } else {
                // production mode
                myUrl = `http://${window.location.host}${inferHealthAPI}`;
            }


            const response = await fetch(`${myUrl}`, {
                method: 'GET',
                headers: {
                    'X-IP-Host': `${ip}:${port}`,
                },
                //signal: AbortSignal.timeout(1000)
            })

            if (response.status === 200) {
                myOnline = true;
            }
        } catch (error) {
            if (error.name === "TimeoutError") {
                console.log('1000 ms timeout');
            }
        } finally {

            console.log(ip,port,myOnline)
            setOnline(myOnline);
        }
    }


    useEffect(() => {

        // setIp(props.ip);
        // setPort(props.port);

        getSignal();
        const interval = setInterval(async () => {
            getSignal();
        }, 5000);

        return () => clearInterval(interval);

    }, [ip,port]);

    return (

        <div>
            {ip}:{port}
            {
                (online === true) ? <img src={LightGreenIcon} width={20} height={20} ip={ip} port={port}/> :
                    (online === false) ? <img src={LightRedIcon} width={20} height={20} ip={ip} port={port}/> :
                        <img src={LightGrayIcon} width={20} height={20} ip={ip} port={port}/>

            }

        </div>
    );
});

export default ServerSignal;

