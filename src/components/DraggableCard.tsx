import { MouseEvent, useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';

import { datasetImgAPI } from '../APIPath';
import { openImgInNewTab } from '../utils';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentList, setAddList, setToggleItem } from '../redux/store/slice/currentSelected';

const DraggableCard = ({ item, index, isGolden, onHover, onShiftSelect }: { item: any; index: number; isGolden?: boolean; onHover: (img: string) => void; onShiftSelect: (myIndex: number, myStr1: string, myStr2: string) => void }) => {

    const [shiftDown, setShiftDown] = useState(false);

    const dispatch = useDispatch();

    const selectedList = useSelector(selectCurrentList).list;

    const handleClick = (e: MouseEvent, img: string) => {

        console.log('index', index)
        console.log('item', item)
        console.log('parent', e.currentTarget.parentNode)
        console.log('e', (e.currentTarget.parentElement) ? e.currentTarget.parentElement.getAttribute('data-rbd-droppable-id') : '')




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
                            <div
                                ref={provided.innerRef}
                                className={(selectedList.includes(item.image_uuid)) ? "drag-item-golden-selected" : "drag-item-golden"}
                                onClick={(e) => handleClick(e, item.image_uuid)}
                                onMouseOver={(e) => handleMouseOver(e, item.image_uuid)}
                                onMouseLeave={(e) => handleMouseLeave(e, item.image_uuid)}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                            >
                                <img src={datasetImgAPI(item.image_uuid, 256)} alt="img" />
                            </div>
                        );
                    } else {
                        return (
                            <div
                                ref={provided.innerRef}
                                className={(selectedList.includes(item.image_uuid)) ? "drag-item-selected" : "drag-item"}
                                style={{ backgroundColor: 'red' }}
                                onClick={(e) => handleClick(e, item.image_uuid)}
                                onMouseOver={(e) => handleMouseOver(e, item.image_uuid)}
                                onMouseLeave={(e) => handleMouseLeave(e, item.image_uuid)}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                            >
                                <img src={datasetImgAPI(item.image_uuid, 60)} alt="img" />
                            </div>
                        );
                    }
                }}
            </Draggable>
        </>
    );
};

export default DraggableCard;
