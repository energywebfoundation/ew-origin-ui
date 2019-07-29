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
import { Demand, Agreement, Supply } from 'ew-market-lib';

import { Table } from '../elements/Table/Table';
import TableUtils from '../elements/utils/TableUtils';
import { showNotification, NotificationType } from '../utils/notifications';
import { deleteDemand } from 'ew-market-lib/dist/js/src/blockchain-facade/Demand';
import { IPaginatedLoaderState, PaginatedLoader, DEFAULT_PAGE_SIZE, IPaginatedLoaderFetchDataParameters, IPaginatedLoaderFetchDataReturnValues } from '../elements/Table/PaginatedLoader';

export interface IDemandTableProps {
    conf: any;
    demands: Demand.Entity[];
    producingAssets: ProducingAsset.Entity[];
    agreements: Agreement.Entity[];
    currentUser: User;
    switchedToOrganization: boolean;
    baseUrl: string;
    supplies: Supply.Entity[];
}

export interface IDemandTableState extends IPaginatedLoaderState {
    showMatchingSupply: number;
    switchedToOrganization: boolean;
}

export interface IEnrichedDemandData {
    demand: Demand.Entity;
    demandOwner: User;
    producingAsset?: ProducingAsset.Entity;
}

export const PeriodToSeconds = [31536000, 2592000, 86400, 3600];

const NO_VALUE_TEXT = 'any';

enum OPERATIONS {
    
}

export class AgreementTable extends PaginatedLoader<IDemandTableProps, IDemandTableState> {
    constructor(props: IDemandTableProps) {
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
        this.showMatchingSupply = this.showMatchingSupply.bind(this);
    }

    switchToOrganization(switchedToOrganization: boolean) {
        this.setState({
            switchedToOrganization
        });
    }

    async enrichData(demands: Demand.Entity[]) : Promise<IEnrichedDemandData[]> {
        const promises = demands.map(async (demand: Demand.Entity) => {
            const result: IEnrichedDemandData = {
                demand,
                producingAsset: null,
                demandOwner: await (new User(demand.demandOwner, this.props.conf)).sync()
            };

            if (demand.offChainProperties) {
                if (typeof(demand.offChainProperties.productingAsset) !== 'undefined') {
                    result.producingAsset = this.props.producingAssets.find(
                        (asset: ProducingAsset.Entity) =>
                            asset.id === demand.offChainProperties.productingAsset.toString()
                    );
                }
            }

            return result;
        });

        return Promise.all(promises);
    }

    getCountryRegionText(demand: Demand.Entity): string {
        let text = '';

        if (demand.offChainProperties.locationCountry) {
            text += demand.offChainProperties.locationCountry;
        }

        if (demand.offChainProperties.locationRegion) {
            text += `, ${demand.offChainProperties.locationRegion}`;
        }

        return text || NO_VALUE_TEXT;
    }

    async operationClicked(key: string, id: number) {
        switch (key) {
            default:
        }
    }

    async deleteDemand(id: number) {
        try {
            this.props.conf.blockchainProperties.activeUser = {
                address: this.props.currentUser.id
            };
            await deleteDemand(id, this.props.conf);

            showNotification('Demand deleted', NotificationType.Success);
        } catch (error) {
            console.error(error);
            showNotification(`Can't delete demand`, NotificationType.Error);
        }
    }

    showMatchingSupply(demandId: number) {
        this.setState({
            showMatchingSupply: demandId
        });
    }

    async getPaginatedData({ pageSize, offset }: IPaginatedLoaderFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues> {
        const { agreements } = this.props;

        const total = agreements.length;
        

        const data = agreements.map(
            (agreement) => {
                return [
                    agreement.id,
                    agreement.supplyId,
                    agreement.demandId
                ];
            }
        ).slice(offset, offset + pageSize);

        return {
            data,
            total
        };
    }

    async componentDidUpdate(prevProps) {
        if (prevProps.demands.length !== this.props.demands.length
            || prevProps.supplies.length !== this.props.supplies.length
            || prevProps.agreements.length !== this.props.agreements.length
        ) {
            console.log('component did update', 
                `Demands: ${prevProps.demands.length} vs ${this.props.demands.length}`,
                `Supply: ${prevProps.supplies.length} vs ${this.props.supplies.length}`,
                `Agreements: ${prevProps.agreements.length} vs ${this.props.agreements.length}`,
            );
            this.loadPage(1);
        }
    }

    render() {
        if (this.state.showMatchingSupply !== null) {
            return (
                <Redirect push={true} to={`/${this.props.baseUrl}/certificates/for_demand/${this.state.showMatchingSupply}`} />
            );
        }

        const defaultWidth = 106;
        const generateHeader = (label, width = defaultWidth, right = false, body = false) =>
            TableUtils.generateHeader(label, width, right, body);
        const generateFooter = TableUtils.generateFooter;

        const TableFooter = [
            {
                label: ' ',
                key: 'not',
                colspan: 2
            },
            generateFooter('Power (kWh)', true)
        ];


        const TableHeader = [
            generateHeader('#'),
            generateHeader('Supply ID'),
            generateHeader('Demand ID'),
        ];

        return (
            <div className="ForSaleWrapper">
                <Table
                    classNames={['bare-font', 'bare-padding']}
                    header={TableHeader}
                    actions={true}
                    data={this.state.data}
                    actionWidth={55.39}
                    operations={Object.values(OPERATIONS)}
                    operationClicked={this.operationClicked}
                    loadPage={this.loadPage}
                    total={this.state.total}
                    pageSize={this.state.pageSize}
                    footer={TableFooter}
                />
            </div>
        );
    }
}
