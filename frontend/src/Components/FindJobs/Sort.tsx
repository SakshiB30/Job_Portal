import { useEffect, useState } from 'react';
import { Combobox, useCombobox} from '@mantine/core';
import { IconAdjustments } from '@tabler/icons-react';

type SortProps = {
  selectedItem?: string | null;
  onSortChange?: (value: string) => void;
};

const opt = ['Relevance', 'Salary High to Low', 'Salary Low to High', 'Experience High to Low', 'Experience Low to High'];

const Sort = ({ selectedItem: selectedItemProp, onSortChange }: SortProps) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(selectedItemProp ?? opt[0]);

  useEffect(() => {
    if (selectedItemProp !== undefined) {
      setSelectedItem(selectedItemProp);
    }
  }, [selectedItemProp]);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const options = opt.map((item) => (
    <Combobox.Option className='text-xs' value={item} key={item}>
      {item}
    </Combobox.Option>
  ));

  return (
    <>
      <Combobox
        store={combobox}
        width={150}
        position="bottom-start"
        onOptionSubmit={(val) => {
          if (onSortChange) {
            onSortChange(val);
          } else {
            setSelectedItem(val);
          }
          combobox.closeDropdown();
        }}
      >
        <Combobox.Target>
          <div onClick={()=> combobox.toggleDropdown()} className='cursor-pointer border border-bright-sun-400 flex gap-2 px-2 py-1 text-sm rounded-xl items-center'>
            {selectedItem} <IconAdjustments className= 'h-5 w-5 text-bright-sun-400'/>
          </div>
        </Combobox.Target>

        <Combobox.Dropdown >
          <Combobox.Options>{options}</Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </>
  );
}

export default Sort