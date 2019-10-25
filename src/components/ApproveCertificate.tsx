import * as React from 'react';
import * as EwAsset from 'ew-asset-registry-lib'; 
import * as EwUser from 'ew-user-registry-lib';
import * as General from 'ew-utils-general-lib';
import { Certificate } from 'ew-origin-lib';
import { Supply, Agreement } from 'ew-market-lib';
import { Erc20TestToken } from 'ew-erc-test-contracts';

import './ApproveCertificate.scss'
import { Moment } from 'moment';
import moment = require('moment');

interface Props {
    conf: any;
    certificates: Certificate.Entity[];
    producingAssets: EwAsset.ProducingAsset.Entity[];
    supplies: Supply.Entity[];
    currentUser: EwUser.User;
    baseUrl: string;
    agreements: Agreement.Entity[];
}

interface State {
    certificateId: number;
    reportedFlexibility: string;
}

async function getMetaMaskAccount() {
    return new Promise(resolve => {
        (window as any).web3.eth.getAccounts((error, accounts) => resolve(accounts[0]))
    });
}

export class ApproveCertificate extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            certificateId: -1,
            reportedFlexibility: ''
        };
    }

    async approveCertificate(
        certificateId: number
    ) {
        this.props.conf.blockchainProperties.activeUser = {
            address: this.props.currentUser.id
        };

        const certificate = this.props.certificates.find((c: Certificate.Entity) => {
            return c.id === certificateId.toString();
        });

        const priceInDAI = await certificate.getFlexibilityTotalPriceInDAI();
        const tokenAddress = await certificate.tokenAddress();
        const tokenReceiver = await certificate.tokenReceiver();
        const tokenHolder = await certificate.tokenHolder();
        const certificateLogicAddress = certificate.configuration.blockchainProperties.certificateLogicInstance.web3Contract._address;

        console.log('approveCertificate', {
            priceInDAI,
            tokenAddress,
            tokenReceiver,
            tokenHolder,
            certificateLogicAddress
        });

        const token = new Erc20TestToken(
            this.props.conf.blockchainProperties.web3,
            tokenAddress
        );

        const allowance = await token.allowance(tokenHolder, certificateLogicAddress);

        console.log(`token.allowance(${tokenHolder}, ${certificateLogicAddress})`);

        console.log('token', {
            allowance
        });

        await certificate.approveFlexibility();
    }

    async getReportedFlexibility(
        certificateId: number
    ) {
        this.setState({
            reportedFlexibility: ''
        });

        this.props.conf.blockchainProperties.activeUser = {
            address: (this.props.currentUser && this.props.currentUser.id) || await getMetaMaskAccount()
        };

        const certificate = this.props.certificates.find((c: Certificate.Entity) => {
            return c.id === certificateId.toString();
        });

        let reportedFlexibility = `Found 0 flexibilty for id ${certificateId.toString()}.`;

        if (certificate) {
            await certificate.sync();

            const totalFlexibilityPrice = await certificate.getFlexibilityTotalPriceInEUR();

            const supply = this.props.supplies.find((s: Supply.Entity) => {
                return s.id.toString() === certificate.supplyId.toString();
            });

            console.log({
                totalFlexibilityPrice
            });

            console.log('getReportedFlex', certificate.powerInW, certificate);
    
            try {
                reportedFlexibility = await this.parseFlexibility(certificate, totalFlexibilityPrice, supply && supply.price.toString());
            } catch (error) {
    
            }    
        }
        
        this.setState({
            reportedFlexibility
        });
    }

    async parseFlexibility(flexibility: Certificate.Entity, totalFlexibilityPrice: string, supplyPrice: string): Promise<string> {
        const information = [];

        console.log('parseFlexibility', {
            flexibility,
            supplyId: flexibility.supplyId
        });

        if (typeof(flexibility.approved) !== 'undefined') {
            information.push(`Report confirmed: ${flexibility.approved}`);
        }

        if (typeof(flexibility.powerInW) !== 'undefined') {
            information.push(`Energy amount (kWh): ${!isNaN(parseInt(flexibility.powerInW.toString(), 10)) ? `${flexibility.powerInW / 1000} kW` : ''}`);
        }

        const supply = this.props.supplies.find(supply => {
            return supply.id === flexibility.supplyId.toString();
        })

        if (supply) {
            if (typeof(supply.startTime) !== 'undefined') {
                information.push(`Timeframe start: ${moment(supply.startTime, 'x').format("DD MMM YYYY HH:mm")}`);
            }

            if (typeof(supply.endTime) !== 'undefined') {
                information.push(`Timeframe end: ${moment(supply.endTime, 'x').format("DD MMM YYYY HH:mm")}`);
            }
        }

        if (typeof(flexibility.averagePower) !== 'undefined') {
            information.push(`Average power: ${!isNaN(parseInt(flexibility.averagePower.toString(), 10)) ? `${flexibility.averagePower / 1000} kW` : ''}`);
        }

        if (typeof(flexibility.powerProfileURL) !== 'undefined') {
            information.push(`Power profile URL: ${flexibility.powerProfileURL}`);
        }

        if (typeof(flexibility.powerProfileHash) !== 'undefined') {
            information.push(`Power profile hash: ${flexibility.powerProfileHash}`);
        }

        if (typeof(supplyPrice) !== 'undefined') {
            information.push(`Supply price per kWh: ${parseInt(supplyPrice, 10) / 100} EUR`);
        }

        if (typeof(totalFlexibilityPrice) !== 'undefined') {
            information.push(`Total price: ${parseInt(totalFlexibilityPrice, 10) / 10**18} EUR`);
        }

        try {
            const agreement = this.props.agreements.find(a => {
                return a.supplyId.toString() === flexibility.supplyId.toString();
            });

            if (agreement) {
                if (typeof(agreement.id) !== 'undefined') {
                    information.push(`Activation ID: ${agreement.id}`);
                }
            }

            console.log('agreement', agreement)
        } catch (error) {
            console.error('ApproveCertificate agreement error', error);
        }
        
        return information.join(`\n`);
    }

    render() {
        const {
            certificateId,
            reportedFlexibility
        } = this.state;

        return <div className='PageWrapper CreateSupply_wrapper'>
            <input className="CreateSupply_input" onChange={(e) => this.setState({ certificateId: parseInt(e.target.value, 10) })} placeholder="Certificate ID (0, 1, 2... etc.)"/>
            <br/><br/>
            <button onClick={() => this.approveCertificate(
                certificateId
            )} className="CreateSupply_button">Approve Certificate</button>
            <hr/>
            <button onClick={() => this.getReportedFlexibility(
                certificateId
            )} className="CreateSupply_button">Get Reported Flexibility</button>
            <br/><br/>
            {reportedFlexibility && <div className="CreateSupply_display">{reportedFlexibility}</div>}
        </div>;

    }

}