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
import { Table, ITableAdminHeaderData } from '../elements/Table/Table';
import { User } from 'ew-user-registry-lib';
import { AssetType, TimeFrame, Currency, Configuration } from 'ew-utils-general-lib';
import { Compliance } from 'ew-asset-registry-lib/dist/js/src/blockchain-facade/ProducingAsset';
import { ProducingAsset } from 'ew-asset-registry-lib';
import { Demand } from 'ew-market-lib';
import { showNotification, NotificationType } from '../utils/notifications';

export interface IOnboardDemandProps {
    configuration: any;
    currentUser: User;
    producingAssets: ProducingAsset.Entity[];
}

export class OnboardDemand extends React.Component<IOnboardDemandProps, {}> {
    constructor(props) {
        super(props);
        this.createDemand = this.createDemand.bind(this);
    }

    async createDemand(input: any) {
        const creationDemandProperties = {
            otherGreenAttributes: '',
            typeOfPublicSupport: '',
            pricePerCertifiedWh: 0,
            assettype: AssetType.Wind,
            registryCompliance: Compliance.none,
            timeframe: TimeFrame.yearly,
            currency: Currency.EUR
        };

        const transformedInput = { ...input };

        if (typeof(transformedInput.targetWhPerPeriod) !== 'undefined') {
            transformedInput.targetWhPerPeriod = parseInt(transformedInput.targetWhPerPeriod, 10);
        }

        transformedInput.targetWhPerPeriod = transformedInput.targetWhPerPeriod * 1000;

        if (typeof(transformedInput.startTime) !== 'undefined') {
            transformedInput.startTime = (transformedInput.startTime * 1000).toString();
        }

        if (typeof(transformedInput.endTime) !== 'undefined') {
            transformedInput.endTime = (transformedInput.endTime * 1000).toString();
        }

        const demandOffchainProps: Demand.IDemandOffChainProperties = {
            timeframe: creationDemandProperties.timeframe,
            pricePerCertifiedWh: creationDemandProperties.pricePerCertifiedWh,
            currency: creationDemandProperties.currency,
            otherGreenAttributes: creationDemandProperties.otherGreenAttributes,
            typeOfPublicSupport: creationDemandProperties.typeOfPublicSupport,
            targetWhPerPeriod: transformedInput.targetWhPerPeriod,
            registryCompliance: creationDemandProperties.registryCompliance,
            startTime: transformedInput.startTime || '',
            endTime: transformedInput.endTime || '',
            locationCountry: '',
            assettype: AssetType.Wind,
            consumingAsset: 0,
            locationRegion: '',
            minCO2Offset: 0
        };

        if (typeof transformedInput.locationRegion !== 'undefined') {
            demandOffchainProps.locationRegion = transformedInput.locationRegion;
        }

        const demandProps: Demand.IDemandOnChainProperties = {
            url: '',
            propertiesDocumentHash: '',
            demandOwner: this.props.currentUser.id
        };

        try {
            this.props.configuration.blockchainProperties.activeUser = {
                address: this.props.currentUser.id
            };

            await Demand.createDemand(demandProps, demandOffchainProps, this.props.configuration);

            showNotification('Demand created', NotificationType.Success);
        } catch (error) {
            console.error('Error in OnboardDemand: ', error);
            showNotification(`Can't create demand`, NotificationType.Error);
        }
    }

    render() {
        const Tables : ITableAdminHeaderData[] = [
            {
                header: 'General'
            },
            {
                data: [
                    {
                        label: 'Power in kW',
                        key: 'targetWhPerPeriod',
                        toggle: { hide: true, description: '' },
                        input: { type: 'text' }
                    },

                    {
                        label: 'Start Date',
                        key: 'startTime',
                        toggle: { hide: true, description: '' },
                        input: { type: 'date' }
                    },
                    {
                        label: 'End Date',
                        key: 'endTime',
                        toggle: { hide: true, description: '' },
                        input: { type: 'date' }
                    }
                ]
            },
            {
                header: 'Location'
            },
            {
                data: [
                    {
                        label: 'Region',
                        key: 'locationRegion',
                        toggle: {
                            label: 'All',
                            index: 4,
                            description: 'Only this Region'
                        },
                        input: {
                            type: 'text'
                        }
                    }
                ]
            },
            {
                header: true,
                footer: 'Create Demand',
                footerClick: this.createDemand
            }
        ];

        const assetTypes = ['Wind', 'Solar', 'RunRiverHydro', 'BiomassGas'];
        const compliances = ['none', 'IREC', 'EEC', 'TIGR'];
        const timeframes = ['yearly', 'monthly', 'daily'];

        return (
            <div className="OnboardDemandWrapper">
                <Table
                    type="admin"
                    header={Tables}
                    data={{ assetTypes, compliances, timeframes }}
                />
            </div>
        );
    }
}
