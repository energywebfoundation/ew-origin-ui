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
import * as ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import { AppContainer } from './components/AppContainer';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import reducer from './reducers';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
    certificateCreatedOrUpdated,
    currentUserUpdated,
    consumingAssetCreatedOrUpdated,
    demandCreatedOrUpdated,
    producingAssetCreatedOrUpdated,
    configurationUpdated,
    demandDeleted
} from './actions';
import './index.scss';

const store = createStore<any>(reducer);

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(
        {
            currentUserUpdated,
            configurationUpdated,
            demandCreatedOrUpdated,
            demandDeleted,
            producingAssetCreatedOrUpdated,
            certificateCreatedOrUpdated,
            consumingAssetCreatedOrUpdated
        },
        dispatch
    )
});

const mapStateToProps = state => {
    return state;
};

ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter>
            <Route
                path="/:contractAddress/"
                component={connect(
                    mapStateToProps,
                    mapDispatchToProps
                )(AppContainer)}
            />
        </BrowserRouter>
    </Provider>,
    document.getElementById('root')
);
