import React, { Dispatch, FormEventHandler, SetStateAction } from 'react';

const CustomTab = (props) => {

    // return (
    //     <>
    //         {
    //             (props.warn) ?
    //                 <div className='my-tab-component'>
    //                     <div className='my-tab-wrapper'>
    //                         <div className='my-tab-left-warn' style={{backgroundColor:(props.focus)?'#D9FFFF':'#FAFAFD'}}></div>
    //                         <div className='my-tab-warn' style={{backgroundColor:(props.focus)?'#D9FFFF':'#FAFAFD'}}>
    //                             {props.label}: <b style={{color:'black'}}>{props.value}</b>
    //                         </div>
    //                         <div className='my-tab-right-warn' style={{backgroundColor:(props.focus)?'#D9FFFF':'#FAFAFD'}}></div>
    //                     </div>
    //                 </div>
    //                 :
    //                 <div className='my-tab-component'>
    //                     <div className='my-tab-wrapper'>
    //                         <div className='my-tab-left' style={{backgroundColor:(props.focus)?'#D9FFFF':'#FAFAFD'}}></div>
    //                         <div className='my-tab' style={{backgroundColor:(props.focus)?'#D9FFFF':'#FAFAFD'}}>
    //                             {props.label}: <b style={{color:'black'}}>{props.value}</b>
    //                         </div>
    //                         <div className='my-tab-right' style={{backgroundColor:(props.focus)?'#D9FFFF':'#FAFAFD'}}></div>
    //                     </div>
    //                 </div>
    //         }

    //     </>
    // );

    return (
        <div className='my-tab-component'>
            <div className='my-tab-wrapper'>
                <ul className='my-round-tab-ul'>
                    <li className={(props.focus)?'my-round-tab-li-selected':'my-round-tab-li'} style={{borderColor:(props.warn)?'#FF8000':'#979CB580'}}>{props.label}: <b style={{color:'black'}}>{props.value}</b></li>
                </ul>
            </div>
        </div>
    );
};

export default CustomTab;
