/*
* Copyright 2021, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from "react";
import {Glyphicon} from 'react-bootstrap';
import { connect } from "react-redux";

import { toggleHighlightFeature } from '@mapstore/actions/mapInfo';
import { toggleControl } from "@mapstore/actions/controls";
import Message from "@mapstore/components/I18N/Message";

import UrbanismeToolbar from './urbanisme/UrbanismeToolbar';
import urbanismeEpic from '../epics/urbanisme';
import urbanismeReducer from '../reducers/urbanisme';
import {setUp, toggleGFIPanel, printSubmit, toggleUrbanismeTool} from '../actions/urbanisme';
import {CONTROL_NAME} from '../constants';
import '../../assets/style.css';

const Urbanisme = connect((state) => ({
    enabled: state.controls && state.controls.urbanisme && state.controls.urbanisme.enabled || false,
    urbanisme: state?.urbanisme || {}
}), {
    onSetUp: setUp,
    togglePanel: toggleGFIPanel,
    onToggleTool: toggleUrbanismeTool,
    onToggleControl: toggleControl,
    toggleHighlightFeature,
    onPrint: printSubmit
})(UrbanismeToolbar);

/**
 * Urbanisme tools Plugin. Allow to fetch NRU and ADS data on parcelle layer
 * and to print the data onto pdf
 *
 * @name Urbanisme
 * @memberof plugins
 */
const UrbanismePlugin = {
    name: "Urbanisme",
    component: Urbanisme,
    containers: {
        BurgerMenu: {
            name: CONTROL_NAME,
            text: <Message msgId="urbanisme.title"/>,
            icon: <Glyphicon glyph="th-list" />,
            action: toggleControl.bind(null, CONTROL_NAME, null),
            position: 1501,
            doNotHide: true,
            priority: 2
        }
    },
    epics: urbanismeEpic,
    reducers: { urbanisme: urbanismeReducer }
};

export default UrbanismePlugin;
