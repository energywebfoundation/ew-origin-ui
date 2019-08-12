import { Component, ReactText } from 'react';
import { ICustomFilter, CustomFilterInputType } from './FiltersHeader';
import { getPropertyByPath } from '../../utils/Helper';
import moment, { Moment } from 'moment';

export const DEFAULT_PAGE_SIZE = 25;

export type IPaginatedLoaderProps = any;

export interface IPaginatedLoaderState {
    paginatedData: any[];
    formattedPaginatedData: ReactText[][];
    pageSize: number;
    total: number;
    appliedFilters: ICustomFilter[];
}

export interface IPaginatedLoaderFetchDataParameters {
    pageSize: number;
    offset: number;
    filters?: ICustomFilter[];
}

export interface IPaginatedLoaderFetchDataReturnValues {
    paginatedData: any[];
    formattedPaginatedData: ReactText[][];
    total: number;
}

export interface IPaginatedLoader {
    getPaginatedData({ pageSize, offset, filters }: IPaginatedLoaderFetchDataParameters) : Promise<IPaginatedLoaderFetchDataReturnValues>
}

export const PAGINATED_LOADER_INITIAL_STATE: IPaginatedLoaderState = {
    paginatedData: [],
    formattedPaginatedData: [],
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
    appliedFilters: []
};

export function getInitialPaginatedLoaderState(): IPaginatedLoaderState {
    return JSON.parse(JSON.stringify(PAGINATED_LOADER_INITIAL_STATE));
}

function indexOfEnd(baseString: string, searchString: string) {
    const index = baseString.indexOf(searchString);
    
    return index == -1 ? -1 : index + searchString.length;
}

export enum FILTER_SPECIAL_TYPES {
    COMBINE = 'FILTER_COMBINE',
    DATE_YEAR = 'FILTER_DATE_YEAR',
    DIVIDE = 'FILTER_DIVIDE'
};

export const RECORD_INDICATOR = 'RECORD|';
const FILTER_PROPERTY_SEPARATOR = '::';

function getIndividualPropertyFilterValue(record: any, property: string) {
    const recordSignIndex = indexOfEnd(property, RECORD_INDICATOR);

    if (recordSignIndex === -1) {
        return property;
    }

    const recordPropertyName = property.slice(recordSignIndex, property.length);

    return getPropertyByPath(record, recordPropertyName);
}

const FILTER_PROPERTY_PROCESSING_FUNCTIONS = {
    [FILTER_SPECIAL_TYPES.COMBINE]: function(record: any, ...properties: string[]) {
        return properties.map(property => getIndividualPropertyFilterValue(record, property)).join('');
    },
    [FILTER_SPECIAL_TYPES.DATE_YEAR]: function(record: any, property: string) {
        return moment.unix(parseInt(getIndividualPropertyFilterValue(record, property), 10)).year();
    },
    [FILTER_SPECIAL_TYPES.DIVIDE]: function(record: any, ...properties: string[]) {
        return properties.map(property => getIndividualPropertyFilterValue(record, property)).reduce(
            (a, b, index) => index === 0 ? a : a / b
        );
    }
};

function parseFilter(record: any, property: string) { 
    if (property.indexOf(FILTER_PROPERTY_SEPARATOR) === -1) {
        return getIndividualPropertyFilterValue(record, property);
    }

    const splitString = property.split(FILTER_PROPERTY_SEPARATOR);

    for (const specialFilterKey of Object.keys(FILTER_SPECIAL_TYPES)) {
        const specialFilter = FILTER_SPECIAL_TYPES[specialFilterKey];

        if (splitString[0] === specialFilter) {
            return FILTER_PROPERTY_PROCESSING_FUNCTIONS[specialFilter](record, ...splitString.slice(1, splitString.length));
        }
    }

    return property;
}

export abstract class PaginatedLoader<Props extends IPaginatedLoaderProps, State extends IPaginatedLoaderState> extends Component<Props, State> implements IPaginatedLoader {
    protected _isMounted: boolean = false;

    constructor(props: Props) {
        super(props);

        this.loadPage = this.loadPage.bind(this);
    }

    async componentDidMount() {
        this._isMounted = true;

        await this.loadPage(1);
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    abstract getPaginatedData({ pageSize, offset, filters }: IPaginatedLoaderFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues>

    async loadPage(page: number, filters?: ICustomFilter[]) {
        const {
            pageSize,
            appliedFilters
        } = this.state;

        if (filters) {
            this.setState({
                appliedFilters: filters
            })
        } else if (appliedFilters) {
            filters = appliedFilters;
        }

        const offset = (page - 1) * pageSize;

        const {
            paginatedData,
            formattedPaginatedData,
            total
        } = await this.getPaginatedData({
            pageSize,
            offset,
            filters
        });

        if (!this._isMounted) {
          return;
        }

        this.setState({
            paginatedData,
            formattedPaginatedData,
            total
        });
    }

    checkRecordPassesFilters(record: any, filters: ICustomFilter[]): boolean {
        if (!filters) {
            return true;
        }

        for (const filter of filters) {
            const filteredPropertyResolvedValue = parseFilter(record, filter.property);

            if (typeof(filteredPropertyResolvedValue) !== 'undefined') {
                switch (filter.input.type) {
                    case CustomFilterInputType.string:
                        if (filter.selectedValue && !filteredPropertyResolvedValue.toString().toLowerCase().includes(filter.selectedValue.toLowerCase())) {
                            return false;
                        }
                        break;
                    case CustomFilterInputType.multiselect:
                        if (!filter.selectedValue.includes(filteredPropertyResolvedValue)) {
                            return false;
                        }
                        break;
                    case CustomFilterInputType.dropdown:
                        if (filter.selectedValue && filter.selectedValue.toString() !== filteredPropertyResolvedValue.toString()) {
                            return false;
                        }
                        break;
                    case CustomFilterInputType.slider:
                        if (filter.selectedValue) {
                            const [min, max] = filter.selectedValue as number[];
                            
                            if (filteredPropertyResolvedValue < min || filteredPropertyResolvedValue > max) {
                                return false;
                            }
                        }
                        break;
                    case CustomFilterInputType.yearMonth:
                            if (filter.selectedValue) {
                                const year = (filter.selectedValue as Moment).year();
                                const month = (filter.selectedValue as Moment).month();

                                const recordDate = moment.unix(filteredPropertyResolvedValue);
                                
                                if (recordDate.month() !== month || recordDate.year() !== year) {
                                    return false;
                                }
                            }
                            break;
                }
            }
        }

        return true;
    }
}
