type ClickableListProps<T> = {
    items: string[];
    onSelect: (item: string) => void;
    mRef?: React.Ref<HTMLUListElement> | null;
};

export default function ClickableList<T>(
    props: ClickableListProps<string>
) {
    return (
        <ul ref={props.mRef}>
            {props.items.map((item, i) => (
                <li key={i}>
                    <button onClick={(el) => props.onSelect(item)}>Select</button>
                    {item}
                </li>
            ))}
        </ul>
    );
}