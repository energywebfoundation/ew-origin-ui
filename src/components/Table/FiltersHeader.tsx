import React, { Component } from 'react';
import './FiltersHeader.scss';
import { FilterIcon } from '../icons/FilterIcon';

interface ICustomFilterInput {
    type: string;
}

interface ICustomFilterAvailableOption {
    label: string;
    value: any;
}

interface ICustomFilterOption extends ICustomFilterAvailableOption {
    selected: boolean;
}

export interface ICustomFilterDefinition {
    property: string;
    label: string;
    availableOptions?: ICustomFilterAvailableOption[];
    defaultOptions?: any[];
    input?: ICustomFilterInput;
}

export interface ICustomFilter extends ICustomFilterDefinition {
    selectedValue: any;
}

interface IProps {
    filters: ICustomFilterDefinition[];
    filtersChanged: (filters: ICustomFilter[]) => void;
}

interface IState {
    menuShown: boolean;
    processedFilters: ICustomFilter[];
}

export class FiltersHeader extends Component<IProps, IState> {
    constructor(props, context) {
        super(props, context);

        this.state = {
            menuShown: false,
            processedFilters: []
        };
    }

    toggleOption(targetFilter: ICustomFilter, value: any) {
        let selectedOptions: any[] = targetFilter.selectedValue;

        selectedOptions = selectedOptions.includes(value) ?
            selectedOptions.filter(o => o !== value) : [...selectedOptions, value];

        this.changeFilterValue(targetFilter, selectedOptions);
    }

    changeFilterValue(targetFilter: ICustomFilter, selectedValue: any) {
        const { processedFilters } = this.state;
        const index = processedFilters.indexOf(targetFilter);

        const updatedFilter: ICustomFilter  = {
            ...targetFilter,
            selectedValue
        }

        const updatedFilters = [
            ...processedFilters.slice(0, index),
            updatedFilter,
            ...processedFilters.slice(index + 1)
        ];

        this.props.filtersChanged(updatedFilters);

        this.setState({
            processedFilters: updatedFilters
        });
    }

    setupProcessedFilters() {
        const processedFilters: ICustomFilter[] = this.props.filters.map(filter => ({
            ...filter,
            selectedValue: filter.defaultOptions
        }));

        this.setState({
            processedFilters
        });
    }

    componentDidMount() {
        this.setupProcessedFilters();
    }

    componentDidUpdate(prevProps) {
        if (JSON.stringify(prevProps) === JSON.stringify(this.props)) {
            return;
        }

        this.setupProcessedFilters();
    }

    render() {
        const {
            menuShown,
            processedFilters
        } = this.state;

        return processedFilters && <div className="FiltersHeader">
            <div className={`Filter ${menuShown ? 'Filter-opened' : ''}`} onClick={() => this.setState({ menuShown: !menuShown })}>
                <div className="Filter_icon"><FilterIcon /></div>
                Filter
            </div>
            {menuShown && <div className="Filter_menu">
                {processedFilters.map((filter, index) => {
                    const filterOptions: ICustomFilterOption[] = filter.availableOptions && filter.availableOptions.map(option => ({
                        ...option,
                        selected: (filter.selectedValue as any[]).includes(option.value)
                    }));

                    return <div className="Filter_menu_item" key={index}>
                        <div className="Filter_menu_item_label">{filter.label}</div>
                        {filter.availableOptions && <div className="Filter_menu_item_options">
                            {filterOptions.map((option, index) =>
                                <div onClick={() => this.toggleOption(filter, option.value)} className={`Filter_menu_item_options_option ${option.selected ? 'Filter_menu_item_options_option-selected' : ''}`} key={index}>
                                    <div className="Filter_menu_item_options_option_label">{option.label}</div>
                                </div>)}
                        </div>}
                        {filter.input && <input className="Filter_menu_item_input modal-input" onChange={(e) => this.changeFilterValue(filter, e.target.value)} />}
                    </div>
                })}
            </div>}
        </div>
    }
}