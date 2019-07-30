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
import { Nav } from 'react-bootstrap';

import { NavLink, Redirect, Route } from 'react-router-dom';

import { PageContent } from '../elements/PageContent/PageContent';
import { OnboardDemand } from './OnboardDemand';
import { CreateSupply } from './CreateSupply';
import { CreateAgreement } from './CreateAgreement';
import { AgreementTable } from './AgreementTable';
import { User } from 'ew-user-registry-lib';
import { ProducingAsset } from 'ew-asset-registry-lib';
import { ApproveCertificate } from './ApproveCertificate';
import { Certificate } from 'ew-origin-lib';
import { Supply, Demand, Agreement } from 'ew-market-lib';
import { SaveRead } from './SaveRead';

export interface AdminProps {
    conf: any;
    currentUser: User;
    producingAssets: ProducingAsset.Entity[];
    certificates: Certificate.Entity[];
    supplies: Supply.Entity[];
    demands: Demand.Entity[];
    agreements: Agreement.Entity[];
    baseUrl: string;
}

export class Admin extends React.Component<AdminProps, {}> {
    constructor(props) {
        super(props);
        this.OnboardDemand = this.OnboardDemand.bind(this);
        this.CreateSupply = this.CreateSupply.bind(this);
        this.CreateAgreement = this.CreateAgreement.bind(this);
        this.ApproveCertificate = this.ApproveCertificate.bind(this);
        this.Agreements = this.Agreements.bind(this);
        this.SaveRead = this.SaveRead.bind(this);
    }

    OnboardDemand() {
        return (
            <OnboardDemand
                configuration={this.props.conf}
                currentUser={this.props.currentUser}
                producingAssets={this.props.producingAssets}
            />
        );
    }

    CreateSupply() {
        return (
            <CreateSupply
                configuration={this.props.conf}
                currentUser={this.props.currentUser}
                producingAssets={this.props.producingAssets}
            />
        );
    }

    CreateAgreement() {
        return (
            <CreateAgreement
                configuration={this.props.conf}
                currentUser={this.props.currentUser}
                producingAssets={this.props.producingAssets}
            />
        );
    }

    SaveRead() {
        return (
            <SaveRead
                configuration={this.props.conf}
                currentUser={this.props.currentUser}
                producingAssets={this.props.producingAssets}
            />
        );
    }

    ApproveCertificate() {
        return (
            <ApproveCertificate
                conf={this.props.conf}
                currentUser={this.props.currentUser}
                producingAssets={this.props.producingAssets}
                certificates={this.props.certificates}
                baseUrl={this.props.baseUrl}
                supplies={this.props.supplies}
                agreements={this.props.agreements}
            />
        );
    }

    Agreements() {
            return (
                <AgreementTable
                    conf={this.props.conf}
                    demands={this.props.demands}
                    producingAssets={this.props.producingAssets}
                    currentUser={this.props.currentUser}
                    baseUrl={this.props.baseUrl}
                    supplies={this.props.supplies}
                    agreements={this.props.agreements}
                    switchedToOrganization={false}
                />
            );
        }

    render() {
        const AdminMenu = [
            {
                key: 'onboard_demand',
                label: 'Create Demand',
                component: this.OnboardDemand
            },
            {
                key: 'create_supply',
                label: 'Create Supply',
                component: this.CreateSupply
            },
            {
                key: 'create_agreement',
                label: 'Activate Flexibility',
                component: this.CreateAgreement
            },
            {
                key: 'approve_certificate',
                label: 'Approve Certificate',
                component: this.ApproveCertificate
            },
            {
                key: 'flexibilities',
                label: 'Flexibilities',
                component: this.Agreements
            },
            {
                key: 'save_read',
                label: 'Save SM Read',
                component: this.SaveRead
            }
        ];

        const baseUrl = this.props.baseUrl;

        return (
            <div className="PageWrapper">
                <div className="PageNav">
                    <Nav className="NavMenu">
                        {AdminMenu.map(menu => {
                            return (
                                <li>
                                    <NavLink
                                        exact={true}
                                        to={`/${baseUrl}/admin/${menu.key}`}
                                        activeClassName="active"
                                    >
                                        {menu.label}
                                    </NavLink>
                                </li>
                            );
                        })}
                    </Nav>
                </div>

                <Route
                    path={`/${baseUrl}/admin/:key`}
                    render={props => {
                        const key = props.match.params.key;
                        const matches = AdminMenu.filter(item => {
                            return item.key === key;
                        });

                        return (
                            <PageContent
                                menu={matches.length > 0 ? matches[0] : null}
                                redirectPath={`${baseUrl}/admin`}
                            />
                        );
                    }}
                />
                <Route
                    exact={true}
                    path={`/${baseUrl}/admin`}
                    render={() => (
                        <Redirect to={{ pathname: `/${baseUrl}/admin/${AdminMenu[0].key}` }} />
                    )}
                />
            </div>
        );
    }
}
