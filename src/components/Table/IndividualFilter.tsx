import React, { Component } from 'react';
import { ICustomFilter, CustomFilterInputType } from './FiltersHeader';
import { withStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import { STYLE_CONFIG } from '../../styles/styleConfig';

interface IProps {
    filter: ICustomFilter;
    changeFilterValue: (targetFilter: ICustomFilter, selectedValue: any) => void;
}

const CustomSlider = withStyles({
    root: {
      color: STYLE_CONFIG.PRIMARY_COLOR,
      height: 3,
      padding: '13px 0',
    },
    thumb: {
      height: 27,
      width: 27,
      backgroundColor: '#2c2c2c',
      border: '1px solid currentColor',
      marginTop: -12,
      marginLeft: -13,
      '& .bar': {
        height: 9,
        width: 1,
        backgroundColor: 'currentColor',
        marginLeft: 1,
        marginRight: 1,
      },
    },
    active: {},
    valueLabel: {
        left: 'calc(-50% + 9px)',
        top: -22,
        '& *': {
          background: 'transparent',
          color: 'currentColor',
        },
      },
    track: {
      height: 3,
    },
    rail: {
      color: '#393939',
      opacity: 1,
      height: 3,
    },
    mark: {
        backgroundColor: 'currentColor',
        height: 8,
        width: 1,
        marginTop: -3,
    },
    markActive: {
        backgroundColor: 'currentColor',
    },
  })(Slider);

function CustomSliderThumbComponent(props) {
    return (
      <span {...props}>
          {props.children}
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </span>
    );
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
                return <input className="Filter_menu_item_input modal-input" onChange={(e) => this.props.changeFilterValue(filter, e.target.value)} />
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
                        defaultValue={[filter.input.min, filter.input.max]}
                        min={filter.input.min}
                        max={filter.input.max}
                        ThumbComponent={CustomSliderThumbComponent}
                        onChangeCommitted={(event, value) => this.props.changeFilterValue(filter, value)}
                    />
                </div>;
        }
    }
}