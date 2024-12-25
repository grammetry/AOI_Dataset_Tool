import React, { Dispatch, FormEventHandler, SetStateAction } from 'react';

const MetricTag = (props) => {

    return (
        <>


            <div className="my-metric-tag d-flex flex-column" style={{ width: props.width, height: props.height,borderLeft:'4px solid'+props.color }}>
                
                    <div className='d-flex flex-column justify-content-center gap-1 p-2' style={{height:props.height}}>
                        <div style={{color:'#697A8D',fontSize:12}}>
                            {props.label}
                        </div>
                        <div>
                            {props.value}
                        </div>
                    </div>

            </div>



        </>
    );
};

export default MetricTag;
