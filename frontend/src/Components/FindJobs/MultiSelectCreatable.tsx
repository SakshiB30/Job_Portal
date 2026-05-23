import { Checkbox, Combobox, Group, Input, Pill, PillsInput, useCombobox } from '@mantine/core';
import { IconSelector } from '@tabler/icons-react';
import { useEffect, useState } from 'react';


const MultiSelectCreatable = (props:any) => {
  useEffect(() => {
    setData(props.options);
  }, [props.options]);
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  const [search, setSearch] = useState('');
  const [data, setData] = useState<string[]>([]);
  const [internalValue, setInternalValue] = useState<string[]>([]);
  const value = props.value ?? internalValue;

  const handleValueChange = (nextValue: string[]) => {
    if (props.onChange) {
      props.onChange(nextValue);
    } else {
      setInternalValue(nextValue);
    }
  };

  const exactOptionMatch = data.some((item: string) => item === search);

  const handleValueSelect = (val: string) => {
    setSearch('');

    if (val === '$create') {
      setData((current) => [...current, search]);
      handleValueChange([...value, search]);
    } else {
      const nextValues = value.includes(val)
        ? value.filter((v: string) => v !== val)
        : [...value, val];
      handleValueChange(nextValues);
    }
  };

  const handleValueRemove = (val: string) =>
    handleValueChange(value.filter((v: string) => v !== val));

  const values = value
    .slice(0, 1)
    .map((item: string) => (
      <Pill key={item} withRemoveButton onRemove={() => handleValueRemove(item)}>
        {item}
      </Pill>
    ));

  const options = data
    .filter((item) => item.toLowerCase().includes(search.trim().toLowerCase()))
    .map((item) => (
    <Combobox.Option value={item} key={item} active={value.includes(item)}>
      <Group gap="sm">
        <Checkbox size='xs' color='brightSun.4'
          checked={value.includes(item)}
          onChange={() => {}}
          aria-hidden
          tabIndex={-1}
          style={{ pointerEvents: 'none' }}
        />
        <span className='text-mine-shaft-300'>{item}</span>
      </Group>
    </Combobox.Option>
  ));

  return (
    <Combobox store={combobox} onOptionSubmit={handleValueSelect} withinPortal={false}>
      <Combobox.DropdownTarget>
        <PillsInput variant='unstyled' rightSection={<IconSelector/>} onClick={() => combobox.toggleDropdown()}
        leftSection={
          <div className='text-bright-sun-400 p-1 bg-mine-shaft-900 rounded-full mr-2 '><props.icon/></div>
        }
        >
                    <Pill.Group>
            {value.length > 0 ? (
              <>
                {values}
                {value.length > 1 && (
                  <Pill>+{value.length - 1} more</Pill>
                )}
              </>
            ) : (
              <Input.Placeholder className='text-mine-shaft-300!'>{props.title}</Input.Placeholder>
            )}
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown>
        <Combobox.Search
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            placeholder="Search options"
          />
        <Combobox.Options>
          {options}

          {!exactOptionMatch && search.trim().length > 0 && (
            <Combobox.Option value="$create">+ Create {search}</Combobox.Option>
          )}

          {exactOptionMatch && search.trim().length > 0 && options.length === 0 && (
            <Combobox.Empty>Nothing found</Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

export default MultiSelectCreatable;