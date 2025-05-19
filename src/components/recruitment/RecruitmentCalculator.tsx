import Select, { type MultiValueRemoveProps, components, type Options } from "react-select";
import { cx } from "~/utils/styles.ts";
import CloseIcon from "~/components/icons/CloseIcon.tsx";
import { createRef, useMemo, useState } from "react";
import { Switch } from "~/components/ui/Switch.tsx";
import Tag from "~/components/ui/Tag.tsx";
import { Combination } from "js-combinatorics";

import enRecruitmentTags from "../../../data/en_US/recruitment-tags.json";
import cnRecruitmentTags from "../../../data/zh_CN/recruitment-tags.json";
import jpRecruitmentTags from "../../../data/ja_JP/recruitment-tags.json";
import krRecruitmentTags from "../../../data/ko_KR/recruitment-tags.json";
import { useStore } from "@nanostores/react";
import { localeStore } from "~/pages/[locale]/_store.ts";
import { useTranslations } from "~/i18n/utils.ts";
import { $operators } from "~/pages/[locale]/operators/_store.ts";
import { $recruitment, orderTypeStore, selectedOrderType, TAG_GROUPS } from "~/pages/[locale]/recruitment/_store.ts";
import type * as OutputTypes from "~/types/output-types.ts";
import { operatorAvatar, operatorBranchIcon } from "~/utils/images.ts";
import { professionToClass } from "~/utils/classes.ts";
import { subProfessionIdToBranch } from "~/utils/branches.ts";
import Settings from "~/components/navigation/Settings.tsx";
import type { Locale } from "~/i18n/languages.ts";
import Tooltip from "~/components/ui/Tooltip.tsx";
import StarIcon from "~/components/icons/StarIcon.tsx";
import type { Rarity } from "~/types/output-types.ts";
import SvgRarityGradientDefs from "~/components/operator/SvgRarityGradientDefs.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from "~/components/ui/Dropdown.tsx";
import DropdownArrow from "~/components/icons/DropdownArrow.tsx";
import FilterIcon from "~/components/icons/FilterIcon.tsx";

const TAG_LOCALES = {
  'zh-cn': cnRecruitmentTags,
  en: enRecruitmentTags,
  ja: jpRecruitmentTags,
  ko: krRecruitmentTags,
};
const MultiValueRemove: React.FC<MultiValueRemoveProps> = ({children, ...props}) => {
  return (<div className={cx(
    "flex items-center justify-center w-5 h-5 rounded-l",
    "hover:bg-blue-light/40 bg-blue-light/10 cursor-pointer",
    "text-blue-light"
  )}>
    <components.MultiValueRemove {...props}>
     <CloseIcon />
    </components.MultiValueRemove>
  </div>)
}

const rarityText = {
  1: "from-neutral-50 to-neutral-100",
  2: "from-green-light to-green",
  3: "from-blue-light to-blue",
  4: "from-purple-light to-purple",
  5: "from-yellow-light to-yellow",
  6: "from-orange-light to-orange",
};

const rarityBackground = {
  1: "bg-neutral-50/15 hover:bg-neutral-50/25",
  2: "bg-green/15 hover:bg-green/25",
  3: "bg-blue/15 hover:bg-blue/25",
  4: "bg-purple/15 hover:bg-purple/25",
  5: "bg-yellow/15 hover:bg-yellow/25",
  6: "bg-orange/15 hover:bg-orange/25",
}

const OperatorCompactItem: React.FC<{
  operator: OutputTypes.Operator;
  locale: string;
}> = ({ operator, locale }) => {
  const slug = operator.slug;

  return (
    <a href={`/${locale}/operators/${slug}`}>
    <li
      className={cx("relative rounded p-0.5 max-w-[76px] h-fit list-none flex flex-col items-center", rarityBackground[operator.rarity as keyof typeof rarityBackground])}>
      <img
        loading="lazy"
        className="size-[72px] object-cover object-bottom bg-neutral-700 rounded"
        alt=""
        src={operatorAvatar(operator.charId)}
      />
      <span
        className={cx("bg-gradient-to-b text-transparent bg-clip-text text-center mt-1", rarityText[operator.rarity as keyof typeof rarityText])}>{operator.name}</span>
    </li>
    </a>
  );
};

function getTagCombinations(activeTags: number[]) {
  if (activeTags.length === 0) {
    return [];
  }
  const range = Array(activeTags.length)
    .fill(0)
    .map((_, i) => i + 1);
  return range.flatMap((k) => [...new Combination<number>(activeTags, k)].sort());
}

export interface RecruitableOperator {
  id: string;
  name: string;
  rarity: number;
  tags: number[];
}

export interface RecruitmentResult {
  tags: number[];
  operators: RecruitableOperator[];
  guarantees: number[];
}
interface Props {
  languages: Record<
    Locale,
    {
      url: string;
      label: string;
    }
  >;
}
const RecruitmentCalculator: React.FC<Props> = ({languages}) => {
  const [viewTagList, setViewTagList] = useState(true);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  const operators = useStore($operators);
  const recruitmentData = useStore($recruitment);

  const locale = useStore(localeStore);
  const t = useTranslations(locale);

  const tagData = useMemo(() => TAG_LOCALES[locale], [locale]);
  const tagOptions = useMemo(() => TAG_LOCALES[locale].map((tag) => ({value: tag.tagId, label: tag.tagName})), [locale]);
  const tagGroup = useStore(selectedOrderType);
  const tagOrderType = useStore(orderTypeStore);

  // Transform tags into Select-compatible options
  const options = useMemo(() => {
    return tagData.map(tag => ({
      value: tag.tagId,
      label: tag.tagName
    }));
  }, [tagData]);

  const matchingOperators:RecruitmentResult[] = useMemo(
    () =>
      getTagCombinations(selectedTags.sort())
        .map((tags) => recruitmentData[`${tags}` as keyof typeof recruitmentData])
        .filter((result) => result != null),
    [selectedTags]
  );

  const handleSelectChange = (selectedOptions: any) => {
    if(selectedOptions.length < 5){
      const values = selectedOptions?.map((opt: any) => opt.value) ?? [];
      setSelectedTags(values);
    }
  };

  const guranteedGradient = {
    4: 'bg-gradient-to-r from-transparent to-purple/15',
    5: 'bg-gradient-to-r from-transparent to-yellow/15',
    6: 'bg-gradient-to-r from-transparent to-orange/15',
  }

  return (
    <>
      <div className="text-sm"></div>
      <Select
        options={tagOptions}
        value={options.filter(opt => selectedTags.includes(opt.value))}
        onChange={handleSelectChange}
        isMulti
        unstyled
        components={{
          DropdownIndicator: () => null,
          IndicatorSeparator: () => null,
          CrossIcon: () => <CloseIcon />,
          // @ts-ignore It's complaining that value is not a string but a number otherwise it's okay
          MultiValueRemove,
        }}
        classNames={{
          control: ({ isFocused }) =>
            cx(
              "rounded p-2 transition-shadow",
              "bg-neutral-700",
              isFocused
                ? "border-blue-400 shadow-outline"
                : "border-gray-600"
            ),
          option: ({ isFocused, isSelected }) =>
            cx(
              "px-4 py-2 cursor-pointer",
              "bg-neutral-800",
              isFocused && "bg-neutral-500",
              isSelected && "bg-neutral-600",
            ),
          singleValue: () => cx("text-gray-800 dark:text-gray-200"),
          placeholder: () => cx("text-neutral-400"),
          menu: () =>
            cx(
              "rounded-md overflow-hidden",
              "bg-neutral-800",
              "shadow-lg"
            ),
          clearIndicator: () =>
            cx("flex items-center justify-center cursor-pointer text-neutral-400 hover:text-neutral-200"),
          valueContainer: () => cx("flex gap-2"),
          menuList: () => cx("py-1"),
          multiValue: () =>
            cx("flex items-center flex-row-reverse bg-blue-100 dark:bg-blue-600"),
          multiValueLabel: () =>
            cx("text-sm bg-blue-light/10 text-blue-light pr-1.5 rounded-r"),
        }}
      />

      <div className="my-5 flex items-center justify-between pb-4 border-b border-neutral-600">
        <div className="flex items-center gap-2">
          <Switch id="tagListToggle" checked={viewTagList} onCheckedChange={setViewTagList} />
          <label htmlFor="tagListToggle" className="text-neutral-200">Tag List</label>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="grid grid-cols-[auto,1fr,auto] items-center justify-items-start">
            <span className="text-neutral-200">Tag Order</span>
            <span className="font-semibold">{tagOrderType}</span>
            <DropdownArrow className="mt-1" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value={tagOrderType} onValueChange={(value) => orderTypeStore.set(value as keyof typeof TAG_GROUPS)}>
              {Object.keys(TAG_GROUPS).map((orderType) => (
                <DropdownMenuRadioItem
                  key={orderType}
                  value={orderType}
                >
                  {orderType}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {viewTagList && (
        <>
          {Object.entries(tagGroup).map(([group, items]) => (
            <div key={group} className="mb-4">
              <p className="text-neutral-200 mb-2">{group}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {items.map((item) => {
                  const tag = tagData.find(tag => tag.tagId === item);
                  const isActive = selectedTags.includes(item);
                  return (
                    <Tag
                      key={item}
                      onClick={() => {
                          if (selectedTags.length < 5 && !isActive) {
                            setSelectedTags(prev => [...prev, item])
                            return;
                          }
                          setSelectedTags(prev => prev.filter(tag => tag !== item));
                      }}
                      active={isActive}
                    >
                      {tag?.tagName}
                    </Tag>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}

      <div className="bg-neutral-700 p-5 rounded">
        <div className="flex gap-4 pb-4">
          <p className="font-bold leading-[30px] text-xl">Results</p>
          <Tooltip content={<p>"This option is controlled by global Settings. Click to open"</p>}>
            <div>
            <Settings languages={languages} currentLanguage={locale} serverSelector={true}/>
            </div>
          </Tooltip>
          {selectedTags.length > 0 && <button onClick={() => setSelectedTags([])} className="ml-auto bg-neutral-50 hover:bg-neutral-100 text-neutral-950 flex items-center p-2 rounded gap-1">
            <FilterIcon/>
            <CloseIcon className="size-2.5" />
          </button>}
        </div>
        <div className="border-t border-neutral-500">
          {matchingOperators.length > 0 && matchingOperators.map((item, index) => {
            return <div className="mt-4" key={index}>
              <div className="flex items-center gap-2">
                {item.tags.length > 0 && item.tags.map((tagId: number) => {
                  const tag = tagData.find(tag => tag.tagId === tagId);
                  return <Tag active={true} className="bg-neutral-50">{tag?.tagName}</Tag>
                })}
                {item.guarantees.length > 0 && item.guarantees[0] > 3 && <div className={cx("flex-grow flex py-1 px-2 rounded-r-full justify-end items-center", guranteedGradient[item.guarantees[0] as keyof typeof guranteedGradient])}>
                  <span className={cx("bg-gradient-to-b text-transparent bg-clip-text",rarityText[item.guarantees[0] as keyof typeof rarityText])}>Guranteed {item.guarantees[0]}</span>
                  <StarIcon rarity={item.guarantees[0] as Rarity}/>
                </div>}
              </div>
              <div className="py-4 border-b border-neutral-500 flex flex-wrap gap-2">
                {item.operators.length > 0 && item.operators.map(operator => {
                  const selectedOperator = operators.find(op => op.charId === operator.id);
                  return selectedOperator && <OperatorCompactItem operator={selectedOperator} locale={locale}/>
                })}
              </div>
            </div>
          })}
        </div>
      </div>
      <SvgRarityGradientDefs />
    </>
  );
};

export default RecruitmentCalculator;