import React from 'react';
import "./styles.css";
import Select from "react-select";
import { useState } from "react";

export type OptionType = {
    label: string
    value: number
}


const options = [
    { label: "apple", value: 1 },
    { label: "orange", value: 2 },
    { label: "kiwi", value: 3 }
];

const MySelect = () => {
    const [item, setItem] = useState<OptionType | null>(null);

    console.log(item);

    const handleOption = (selection: OptionType | null) => {
        setItem(selection);
    };

    return (
        <div className="App">
            <h1>Hello CodeSandbox</h1>
            <Select options={options} onChange={handleOption} value={item} />
        </div>
    );
}

export default MySelect;