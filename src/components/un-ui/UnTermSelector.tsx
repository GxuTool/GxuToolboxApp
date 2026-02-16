import {SchoolTerms, SchoolTermValue, SchoolYears, SchoolYearValue} from "@/type/global.ts";
import {UnPicker} from "@/components/un-ui/UnPicker.tsx";
import {useEffect, useState} from "react";
import {Picker, PickerItemProps} from "@react-native-picker/picker";
import {useUserConfig} from "@/hooks/app.ts";

export interface UnTermSelectorProps {
    year?: SchoolYearValue | number;
    term?: SchoolTermValue;
    thirdTerm?: boolean;
    onChange?: (year: SchoolYearValue | number, term: SchoolTermValue) => void;
}

export function UnTermSelector(props: UnTermSelectorProps) {
    const {userConfig} = useUserConfig();
    const [optionList, setOptionList] = useState<PickerItemProps<string>[]>([]);

    useEffect(() => {
        const newOptionList: PickerItemProps<string>[] = [];
        SchoolYears.forEach(schoolYear => {
            Array.from(SchoolTerms)
                .reverse()
                .forEach((term, index) => {
                    if (
                        (!props.thirdTerm && index === 0) ||
                        Number(schoolYear[0]) < Number(userConfig.jw.year) - 5 ||
                        Number(schoolYear[0]) > Number(userConfig.jw.year)
                    )
                        return;
                    newOptionList.push({
                        label: `${schoolYear[1]}学年${term[1]}`,
                        value: `${schoolYear[0]}-${term[0]}`,
                        color: index === 2 ? "#e1cd4c" : "#4ded5a",
                    });
                });
        });
        setOptionList(newOptionList);
    }, []);

    return (
        <UnPicker<string>
            selectedValue={`${props.year ?? userConfig.jw.year}-${props.term ?? userConfig.jw.term}`}
            onValueChange={v => {
                const [year, term] = v.split("-");
                props.onChange?.(+year, term as SchoolTermValue);
            }}>
            {optionList.map((option, index) => (
                <Picker.Item {...option} key={index} />
            ))}
        </UnPicker>
    );
}
