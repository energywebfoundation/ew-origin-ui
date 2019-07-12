import { Component, ReactText } from 'react';

export const DEFAULT_PAGE_SIZE = 25;

export type ITableWrapperProps = any;

export interface ITableWrapperState {
    data: ReactText[][];
    pageSize: number;
    total: number;
}

export interface ITableWrapperFetchDataParameters {
    pageSize: number;
    offset: number;
}

export interface ITableWrapperFetchDataReturnValues {
    data: ReactText[][];
    total: number;
}

export interface ITableWrapper {
    fetchData({ pageSize, offset }: ITableWrapperFetchDataParameters) : Promise<ITableWrapperFetchDataReturnValues>
}

export abstract class TableWrapper<Props extends ITableWrapperProps, State extends ITableWrapperState> extends Component<Props, State> implements ITableWrapper {
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

    abstract fetchData({ pageSize, offset }: ITableWrapperFetchDataParameters): Promise<ITableWrapperFetchDataReturnValues>

    async loadPage(page: number) {
        const {
            pageSize
        } = this.state;

        const offset = (page - 1) * pageSize;
    
        const { total, data } = await this.fetchData({
            pageSize,
            offset
        });
    
        if (!this._isMounted) {
          return;
        }
    
        this.setState({
          data,
          total
        });
    }
}