import * as React from 'react';
import { Table, ITableAdminHeaderData } from '../elements/Table/Table';
import { User } from 'ew-user-registry-lib';
import { AssetType, TimeFrame, Currency, Configuration } from 'ew-utils-general-lib';
import { Compliance } from 'ew-asset-registry-lib/dist/js/src/blockchain-facade/ProducingAsset';
import { ProducingAsset } from 'ew-asset-registry-lib';
import { showNotification, NotificationType } from '../utils/notifications';

interface ICreateSupplyProps {
    configuration: any;
    currentUser: User;
    producingAssets: ProducingAsset.Entity[];
}

async function getMetaMaskAccount() {
    return new Promise(resolve => {
        (window as any).web3.eth.getAccounts((error, accounts) => resolve(accounts[0]))
    });
}

export class SaveRead extends React.Component<ICreateSupplyProps, {}> {
    constructor(props) {
        super(props);
        this.createAgreement = this.createAgreement.bind(this);
    }

    async createAgreement(input: any) {
        const transformedInput = { ...input };

        const producingAsset: ProducingAsset.Entity = this.props.producingAssets.find(p => p.id.toString() === transformedInput.producingAssetID.toString());

        try {
            this.props.configuration.blockchainProperties.activeUser = {
                address: (this.props.currentUser && this.props.currentUser.id) || await getMetaMaskAccount()
            };

            await producingAsset.saveSmartMeterRead(
              transformedInput.meterReading,
              transformedInput.filehash || '',
              transformedInput.timestamp || 0,
              transformedInput.supplyId,
              transformedInput.averagePower || 0,
              transformedInput.powerProfileURL || '',
              transformedInput.powerProfileHash || ''  
            );

            showNotification('Read saved', NotificationType.Success);
        } catch (error) {
            console.error('Error in save read: ', error);
            showNotification(`Can't save read`, NotificationType.Error);
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
                        label: 'Producing asset ID',
                        key: 'producingAssetID',
                        toggle: { hide: true, description: '' },
                        input: { type: 'text' }
                    },
                    {
                        label: 'Meter reading in Wh',
                        key: 'meterReading',
                        toggle: { hide: true, description: '' },
                        input: { type: 'text' }
                    },
                    {
                        label: 'File hash',
                        key: 'filehash',
                        toggle: { hide: true, description: '' },
                        input: { type: 'text' }
                    },
                    {
                        label: 'Timestamp',
                        key: 'timestamp',
                        toggle: { hide: true, description: '' },
                        input: { type: 'text' }
                    },
                    {
                        label: 'Supply ID',
                        key: 'supplyId',
                        toggle: { hide: true, description: '' },
                        input: { type: 'text' }
                    },
                    {
                        label: 'Average power',
                        key: 'averagePower',
                        toggle: { hide: true, description: '' },
                        input: { type: 'text' }
                    },
                    {
                        label: 'Power profile URL',
                        key: 'powerProfileURL',
                        toggle: { hide: true, description: '' },
                        input: { type: 'text' }
                    },
                    {
                        label: 'Power profile hash',
                        key: 'powerProfileHash',
                        toggle: { hide: true, description: '' },
                        input: { type: 'text' }
                    },
                ]
            },
            {
                header: true,
                footer: 'Save SM Read',
                footerClick: this.createAgreement
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
