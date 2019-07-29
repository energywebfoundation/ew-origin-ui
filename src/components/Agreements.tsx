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
import FadeIn from 'react-fade-in';
import { Nav, NavItem } from 'react-bootstrap';
import { BrowserRouter, Route, Link, NavLink, Redirect } from 'react-router-dom';

import { ProducingAsset, ConsumingAsset } from 'ew-asset-registry-lib';
import { User } from 'ew-user-registry-lib';
import { Demand, Supply, Agreement } from 'ew-market-lib';
import { Configuration } from 'ew-utils-general-lib';

import { OrganizationFilter } from './OrganizationFilter';
import { Table } from '../elements/Table/Table';
import TableUtils from '../elements/utils/TableUtils';
import { PageContent } from '../elements/PageContent/PageContent';
import { AgreementTable } from './AgreementTable';

import '../../assets/common.scss';

interface IAgreementsProps {
    conf: any;
    demands: Demand.Entity[];
    agreements: Agreement.Entity[];
    supplies: Supply.Entity[];
    producingAssets: ProducingAsset.Entity[];
    currentUser: User;
    baseUrl: string;
}

export interface IAgreementState {
    switchedToOrganization: boolean;
}

export class Agreements extends React.Component<IAgreementsProps, IAgreementState> {
    constructor(props) {
        super(props);

        this.state = { switchedToOrganization: false };

        this.onFilterOrganization = this.onFilterOrganization.bind(this);
        this.AgreementTable = this.AgreementTable.bind(this);
    }

    onFilterOrganization(index: number) {
        this.setState({
            switchedToOrganization: index !== 0
        });
    }

    AgreementTable() {
        return (
            <AgreementTable
                conf={this.props.conf}
                producingAssets={this.props.producingAssets}
                currentUser={this.props.currentUser}
                agreements={this.props.agreements}
                switchedToOrganization={this.state.switchedToOrganization}
                baseUrl={this.props.baseUrl}
                demands={this.props.demands}
                supplies={this.props.supplies}
            />
        );
    }

    render() {
        const organizations = this.props.currentUser
            ? ['All Organizations', this.props.currentUser.organization]
            : ['All Organizations'];

        const AgreementsMenu = {
            key: 'agreements',
            label: 'Agreements',
            component: this.AgreementTable,
            buttons: [
                // {
                //     type: 'date-range',
                // },
                {
                    type: 'dropdown',
                    label: 'All Organizations',
                    face: ['filter', 'icon'],
                    content: organizations
                }
            ]
        };

        return (
            <div className="PageWrapper">
                <div className="PageNav">
                    <Nav className="NavMenu" />
                </div>

                <PageContent
                    onFilterOrganization={this.onFilterOrganization}
                    menu={AgreementsMenu}
                    redirectPath={'/' + this.props.baseUrl + '/agreements'}
                />
            </div>
        );
    }
}
