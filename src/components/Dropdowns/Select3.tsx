import React from 'react';
import Select from 'react-select';

interface OptionType {
  value: string;
  label: string;
}

const options: OptionType[] = [
  { value: 'apple', label: '蘋果' },
  { value: 'banana', label: '香蕉' },
  { value: 'cherry', label: '櫻桃' },
];

const MySelect: React.FC = () => {
  const [selectedOption, setSelectedOption] = React.useState<OptionType | null>(null);

  const handleChange = (selectedOption: OptionType | null) => {
    setSelectedOption(selectedOption);
  };

  return (
    <Select
      value={selectedOption}
      onChange={handleChange}
      options={options}
    />
  );
};

export default MySelect;