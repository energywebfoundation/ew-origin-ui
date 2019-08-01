// Copyright 2018 Energy Web Foundation
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector,
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH; Heiko Burkhardt, heiko.burkhardt@slock.it; Martin Kuechler, martin.kuchler@slock.it

import * as React from 'react';
import moment from 'moment';

import { Configuration } from 'ew-utils-general-lib';
import { ProducingAsset } from 'ew-asset-registry-lib';

import './SmartMeterReadingsTable.scss';
import { Table } from '../elements/Table/Table';
import TableUtils from '../elements/utils/TableUtils';
import { IPaginatedLoaderState, PaginatedLoader, IPaginatedLoaderFetchDataParameters, IPaginatedLoaderFetchDataReturnValues } from '../elements/Table/PaginatedLoader';

export interface ISmartMeterReadingsTableProps {
    conf: Configuration.Entity;
    producingAsset: ProducingAsset.Entity;
}

export class SmartMeterReadingsTable extends PaginatedLoader<ISmartMeterReadingsTableProps, IPaginatedLoaderState> {
    constructor(props: ISmartMeterReadingsTableProps) {
        super(props);

        this.state = {
            data: [],
            total: 0,
            pageSize: 10
        };
    }

    async getPaginatedData({ pageSize, offset }: IPaginatedLoaderFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues> {
        const readings = (await this.props.producingAsset.getSmartMeterReads());

        const data = [];
        let currentSmartMeterState = 0;

        for (let i = 0; i < readings.length; i++) {
            currentSmartMeterState += readings[i].energy;

            data.push([
                i,
                moment.unix(readings[i].timestamp).format('DD MMM YY, hh:mm:ss'),
                currentSmartMeterState
            ]);
        }

        return {
            data: data.reverse().slice(offset, offset + pageSize),
            total: readings.length
        };
    }

    render() {
        const defaultWidth = 106;
        const generateHeader = (label, width = defaultWidth, right = false, body = false) =>
            TableUtils.generateHeader(label, width, right, body);

        const TableHeader = [
            generateHeader('#', 50),
            generateHeader('Time', 100),
            generateHeader('Smart Meter Value', 100, true),
        ];

        return (
            <div className="smartMeterReadingsTable">
                <Table
                    classNames={['bare-font', 'bare-padding']}
                    header={TableHeader}
                    data={this.state.data}
                    loadPage={this.loadPage}
                    total={this.state.total}
                    pageSize={this.state.pageSize}
                />
            </div>
        );
    }
}
