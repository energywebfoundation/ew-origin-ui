import React, { Component } from 'react';
import { ICustomFilter, CustomFilterInputType } from './FiltersHeader';
import { CustomSlider, CustomSliderThumbComponent } from '../CustomSlider';

interface IProps {
    filter: ICustomFilter;
    changeFilterValue: (targetFilter: ICustomFilter, selectedValue: any) => void;
}

export class IndividualFilter extends Component<IProps> {
    toggleOption(targetFilter: ICustomFilter, value: any) {
        let selectedOptions: any[] = targetFilter.selectedValue;

        selectedOptions = selectedOptions.includes(value) ?
            selectedOptions.filter(o => o !== value) : [...selectedOptions, value];

        this.props.changeFilterValue(targetFilter, selectedOptions);
    }

    render() {
        const {
            filter
        } = this.props;

        switch (filter.input.type) {
            case CustomFilterInputType.string:
                return <input className="Filter_menu_item_input modal-input" onChange={(e) => this.props.changeFilterValue(filter, e.target.value)} value={filter.selectedValue ? filter.selectedValue : ''} />
            case CustomFilterInputType.multiselect:
                return <div className="Filter_menu_item_options">
                    {filter.input.availableOptions.map((option, index) =>
                        <div onClick={() => this.toggleOption(filter, option.value)} className={`Filter_menu_item_options_option ${(filter.selectedValue as any[]).includes(option.value) ? 'Filter_menu_item_options_option-selected' : ''}`} key={index}>
                            <div className="Filter_menu_item_options_option_label">{option.label}</div>
                        </div>)}
                </div>;
            case CustomFilterInputType.dropdown:
                return <select onChange={(e) => this.props.changeFilterValue(filter, e.target.value)} value={filter.selectedValue ? filter.selectedValue : ''} className="Filter_menu_item_input modal-input">
                    <option value="">Any</option>
                    {filter.input.availableOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
                </select>;
            case CustomFilterInputType.slider:
                return <div className="Filter_menu_item_sliderWrapper">
                    <CustomSlider
                        valueLabelDisplay="on"
                        defaultValue={filter.selectedValue || [filter.input.min, filter.input.max]}
                        min={filter.input.min}
                        max={filter.input.max}
                        ThumbComponent={CustomSliderThumbComponent}
                        onChangeCommitted={(event, value) => this.props.changeFilterValue(filter, value)}
                    />
                </div>;
        }
    }
}