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
import { Redirect } from 'react-router-dom';

import { Configuration, TimeFrame, Compliance, AssetType } from 'ew-utils-general-lib';
import { ProducingAsset, ConsumingAsset } from 'ew-asset-registry-lib';
import { User } from 'ew-user-registry-lib';
import { Supply } from 'ew-market-lib';

import { Table } from '../elements/Table/Table';
import TableUtils from '../elements/utils/TableUtils';
import { IPaginatedLoaderState, PaginatedLoader, DEFAULT_PAGE_SIZE, IPaginatedLoaderFetchDataParameters, IPaginatedLoaderFetchDataReturnValues } from '../elements/Table/PaginatedLoader';

interface ISupplyTableProps {
    conf: any;
    supplies: Supply.Entity[];
    producingAssets: ProducingAsset.Entity[];
    currentUser: User;
    switchedToOrganization: boolean;
    baseUrl: string;
}

interface ISupplyTableState extends IPaginatedLoaderState {
    showMatchingSupply: number;
    switchedToOrganization: boolean;
}

interface IEnrichedSupplyData {
    supply: Supply.Entity;
    producingAsset?: ProducingAsset.Entity;
}

const NO_VALUE_TEXT = 'any';

enum OPERATIONS {
    
}

export class SupplyTable extends PaginatedLoader<ISupplyTableProps, ISupplyTableState> {
    constructor(props: ISupplyTableProps) {
        super(props);

        this.state = {
            showMatchingSupply: null,
            switchedToOrganization: false,
            data: [],
            total: 0,
            pageSize: DEFAULT_PAGE_SIZE
        };

        this.switchToOrganization = this.switchToOrganization.bind(this);
        this.operationClicked = this.operationClicked.bind(this);
    }

    switchToOrganization(switchedToOrganization: boolean) {
        this.setState({
            switchedToOrganization
        });
    }

    async enrichData(supplies: Supply.Entity[]) : Promise<IEnrichedSupplyData[]> {
        const promises = supplies.map(async (supply: Supply.Entity) => {
            const result: IEnrichedSupplyData = {
                supply,
                producingAsset: null,
            };

            if (typeof(supply.assetId) !== 'undefined') {
                result.producingAsset = this.props.producingAssets.find(
                    (asset: ProducingAsset.Entity) =>
                        asset.id === supply.assetId.toString()
                );
            }

            return result;
        });

        return Promise.all(promises);
    }

    getCountryRegionText(enrichedData: IEnrichedSupplyData): string {
        let text = '';

        if (enrichedData.producingAsset.offChainProperties.country) {
            text += enrichedData.producingAsset.offChainProperties.country;
        }

        if (enrichedData.producingAsset.offChainProperties.region) {
            text += `, ${enrichedData.producingAsset.offChainProperties.region}`;
        }

        return text || NO_VALUE_TEXT;
    }

    async operationClicked(key: string, id: number) {
        switch (key) {
            default:
        }
    }


    async getPaginatedData({ pageSize, offset }: IPaginatedLoaderFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues> {
        const { supplies } = this.props;
        const enrichedData = await this.enrichData(supplies);

        const total = enrichedData.length;

        const data = enrichedData.map(
            (enrichedSupplyData: IEnrichedSupplyData) => {
                const supply = enrichedSupplyData.supply;

                return [
                    supply.id,
                    (moment(supply.startTime, 'x')).format('DD MMM YY HH:mm') + ' - ' +
                        (moment(supply.endTime, 'x')).format('DD MMM YY HH:mm'),
                    this.getCountryRegionText(enrichedSupplyData),
                    supply.price / 100,
                    'EUR',
                    supply.matchedPower && supply.matchedPower > 0 ? supply.matchedPower / 1000 : supply.matchedPower,
                    (supply.availableWh / 1000).toLocaleString()
                ];
            }
        ).slice(offset, offset + pageSize);

        return {
            data,
            total
        };
    }

    async componentDidUpdate(prevProps) {
        if (prevProps.supplies.length !== this.props.supplies.length) {
            this.loadPage(1);
        }
    }

    render() {
        if (this.state.showMatchingSupply !== null) {
            return (
                <Redirect push={true} to={`/${this.props.baseUrl}/certificates/for_supply/${this.state.showMatchingSupply}`} />
            );
        }

        const defaultWidth = 106;
        const generateHeader = (label, width = defaultWidth, right = false, body = false) =>
            TableUtils.generateHeader(label, width, right, body);
        const generateFooter = TableUtils.generateFooter;

        const TableFooter = [
            {
                label: 'Total',
                key: 'total',
                colspan: 6
            },
            generateFooter('Power (kWh)', true)
        ];

        const TableHeader = [
            generateHeader('#'),
            generateHeader('Start/End-Date'),
            generateHeader('Country,<br/>Region'),
            generateHeader('Price'),
            generateHeader('Currency'),
            generateHeader('Matcher Power (kWh)'),
            generateHeader('Power (kWh)'),
        ];

        return (
            <div className="ForSaleWrapper">
                <Table
                    classNames={['bare-font', 'bare-padding']}
                    header={TableHeader}
                    footer={TableFooter}
                    actions={true}
                    data={this.state.data}
                    actionWidth={55.39}
                    operations={Object.values(OPERATIONS)}
                    operationClicked={this.operationClicked}
                    loadPage={this.loadPage}
                    total={this.state.total}
                    pageSize={this.state.pageSize}
                />
            </div>
        );
    }
}
