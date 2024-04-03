import { MouseEvent, useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { indexOf } from 'lodash';
import { datasetImgAPI } from '../APIPath';
import { openImgInNewTab } from '../utils';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentList, setAddList, setToggleItem } from '../redux/store/slice/currentSelected';

const DraggableCard = ({ item, index, isGolden, onHover, onShiftSelect }: { item: any; index: number; isGolden?: boolean; onHover: (img: string) => void; onShiftSelect: (myIndex: number, myStr1: string, myStr2: string) => void }) => {

    const [shiftDown, setShiftDown] = useState(false);

    const dispatch = useDispatch();

    const selectedList = useSelector(selectCurrentList).list;

    const handleClick = (e: MouseEvent, img: string) => {

        console.log('image click')

        if (e.shiftKey) {
            console.log('shift key down')
            const droppableId = (e.currentTarget.parentElement) ? e.currentTarget.parentElement.getAttribute('data-rbd-droppable-id') : '';
            const str1 = (droppableId) ? droppableId.split('_')[0] : '';
            const str2 = (droppableId) ? droppableId.split('_')[1] : '';
            console.log('str1', str1)
            console.log('str2', str2)
            onShiftSelect(index, str1, str2);
            //e.currentTarget.setAttribute('style','border:0px;')

        } else {
            dispatch(setToggleItem(img));
        }



        if (e.altKey) {
            openImgInNewTab(datasetImgAPI(img));
        }
    };


    const handleMouseOver = (e: MouseEvent, img: string) => {
        onHover(img);
    };

    const handleMouseLeave = (e: MouseEvent, img: string) => {
        console.log('mouse leave')
    };

    return (
        <>

            <Draggable draggableId={item.image_uuid} index={index}>
                {(provided, snapshot) => {
                    if (isGolden) {
                        return (
                            

                            <div style={{ position: 'relative' }} className={(selectedList.includes(item.image_uuid)) ? "drag-item-golden-selected" : "drag-item-golden"}  onClick={(e) => handleClick(e, item.image_uuid)}>
                                <div
                                    ref={provided.innerRef}
                                    className="my-image-gold-item"
                                    style={{ position: 'absolute',top:'4px',left:'4px'}}     
                                    onMouseOver={(e) => handleMouseOver(e, item.image_uuid)}
                                    onMouseLeave={(e) => handleMouseLeave(e, item.image_uuid)}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                >
                                    <img src={datasetImgAPI(item.image_uuid, 60)} alt="img" />
                                </div>
                                {
                                    (indexOf(selectedList, item.image_uuid) >= 0) &&
                                    <div className="my-selected-index-tag d-flex align-items-center justify-content-center">{indexOf(selectedList, item.image_uuid) + 1}</div>
                                }
                            </div>
                        );
                    } else {
                        return (
                            <div style={{ position: 'relative' }} className={(selectedList.includes(item.image_uuid)) ? "drag-item-selected" : "drag-item"}  onClick={(e) => handleClick(e, item.image_uuid)}>
                                <div
                                    ref={provided.innerRef}
                                    className="my-image-item"
                                    style={{ position: 'absolute',top:'4px',left:'4px'}}     
                                    onMouseOver={(e) => handleMouseOver(e, item.image_uuid)}
                                    onMouseLeave={(e) => handleMouseLeave(e, item.image_uuid)}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                >
                                    <img src={datasetImgAPI(item.image_uuid, 60)} alt="img" />
                                </div>
                                {
                                    (indexOf(selectedList, item.image_uuid) >= 0) &&
                                    <div className="my-selected-index-tag d-flex align-items-center justify-content-center">{indexOf(selectedList, item.image_uuid) + 1}</div>
                                }
                            </div>
                        );
                    }
                }}
            </Draggable>
        </>
    );
};

export default DraggableCard;
