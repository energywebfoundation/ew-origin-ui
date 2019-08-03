import * as React from 'react';
import { Table, ITableAdminHeaderData } from '../elements/Table/Table';
import { User } from 'ew-user-registry-lib';
import { AssetType, TimeFrame, Currency, Configuration } from 'ew-utils-general-lib';
import { Compliance } from 'ew-asset-registry-lib/dist/js/src/blockchain-facade/ProducingAsset';
import { ProducingAsset } from 'ew-asset-registry-lib';
import { Supply } from 'ew-market-lib';
import { showNotification, NotificationType } from '../utils/notifications';

export interface ICreateSupplyProps {
    configuration: any;
    currentUser: User;
    producingAssets: ProducingAsset.Entity[];
}

export class CreateSupply extends React.Component<ICreateSupplyProps, {}> {
    constructor(props) {
        super(props);
        this.createSupply = this.createSupply.bind(this);
    }

    async createSupply(input: any) {
        const transformedInput = { ...input };

        if (typeof(transformedInput.power) !== 'undefined') {
            transformedInput.power = parseInt(transformedInput.power, 10);
        }

        transformedInput.power = transformedInput.power * 1000;

        if (typeof(transformedInput.startTime) !== 'undefined') {
            transformedInput.startTime = transformedInput.startTime * 1000;
        }

        if (typeof(transformedInput.endTime) !== 'undefined') {
            transformedInput.endTime = transformedInput.endTime * 1000;
        }

        const supplyProps: Supply.ISupplyOnChainProperties = {
            url: '',
            propertiesDocumentHash: '',
            assetId: transformedInput.assetID,
            currency: Currency.EUR,
            startTime: transformedInput.startTime || 0,
            endTime: transformedInput.endTime || 0,
            availableWh: transformedInput.power,
            price: parseFloat(transformedInput.price) * 100,
            matchedPower: 0
        };

        try {
            this.props.configuration.blockchainProperties.activeUser = {
                address: this.props.currentUser.id
            };

            console.log('CreateSupply', supplyProps);

            await Supply.createSupply(supplyProps, this.props.configuration);

            showNotification('Supply created', NotificationType.Success);
        } catch (error) {
            console.error('Error in Create Supply: ', error);
            showNotification(`Can't create supply`, NotificationType.Error);
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
                        label: 'Asset ID',
                        key: 'assetID',
                        toggle: { hide: true, description: '' },
                        input: { type: 'text' }
                    },
                    {
                        label: 'Power in kW',
                        key: 'power',
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
                    },

                    {
                        label: 'Price in EUR',
                        key: 'price',
                        toggle: { hide: true, description: '' },
                        input: { type: 'text' }
                    }
                ]
            },
            {
                header: true,
                footer: 'Create Supply',
                footerClick: this.createSupply
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
