import * as React from 'react';
import { Table, ITableAdminHeaderData } from '../elements/Table/Table';
import { User } from 'ew-user-registry-lib';
import { AssetType, TimeFrame, Currency, Configuration } from 'ew-utils-general-lib';
import { Compliance } from 'ew-asset-registry-lib/dist/js/src/blockchain-facade/ProducingAsset';
import { ProducingAsset } from 'ew-asset-registry-lib';
import { Agreement } from 'ew-market-lib';
import { showNotification, NotificationType } from '../utils/notifications';

interface ICreateSupplyProps {
    configuration: any;
    currentUser: User;
    producingAssets: ProducingAsset.Entity[];
}

export class CreateAgreement extends React.Component<ICreateSupplyProps, {}> {
    constructor(props) {
        super(props);
        this.createAgreement = this.createAgreement.bind(this);
    }

    async createAgreement(input: any) {
        const transformedInput = { ...input };

        const onChainProps: Agreement.IAgreementOnChainProperties = {
            supplyId: transformedInput.supplyId,
            demandId: transformedInput.demandId,
            allowedMatcher: [''],
            matcherDBURL: '',
            matcherPropertiesDocumentHash: '',
            propertiesDocumentHash: '',
            url: ''
        };

        try {
            this.props.configuration.blockchainProperties.activeUser = {
                address: this.props.currentUser.id
            };

            await Agreement.createAgreement(onChainProps, this.props.configuration);

            showNotification('Flexibility activated', NotificationType.Success);
        } catch (error) {
            console.error('Error in Activate Flexibility: ', error);
            showNotification(`Can't activate flexibility`, NotificationType.Error);
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
                        label: 'Supply ID',
                        key: 'supplyId',
                        toggle: { hide: true, description: '' },
                        input: { type: 'text' }
                    },
                    {
                        label: 'Demand ID',
                        key: 'demandId',
                        toggle: { hide: true, description: '' },
                        input: { type: 'text' }
                    },
                ]
            },
            {
                header: true,
                footer: 'Activate Flexibility',
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
