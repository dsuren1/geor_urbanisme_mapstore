/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from "react";
import assign from 'object-assign';
import PropTypes from 'prop-types';
import {Glyphicon} from 'react-bootstrap';
import { connect } from "react-redux";

import { toggleHighlightFeature } from '@mapstore/actions/mapInfo';
import { toggleControl } from "@mapstore/actions/controls";
import Message from "@mapstore/components/I18N/Message";
import ToolsContainer from '@mapstore/plugins/containers/ToolsContainer';

import NRU from './urbanisme/NRU';
import ADS from './urbanisme/ADS';
import LandPlanPanel from '../components/LandPlanPanel';
import urbanismeEpic from '../epics/urbanisme';
import urbanismeReducer from '../reducers/urbanisme';
import {setUp, toggleGFIPanel, printSpec} from '../actions/urbanisme';
import { CONTROL_NAME } from '../constants';

import '../../assets/style.css';
class Container extends React.Component {
    render() {
        const { children, ...props } = this.props;
        return (<div {...props}>
            {children}
        </div>);
    }
}
class UrbanismeToolbar extends React.Component {
    static propTypes = {
        enabled: PropTypes.boolean,
        items: PropTypes.array,
        onSetUp: PropTypes.func
    }
    static defaultProps = {
        enabled: false,
        items: [],
        onSetUp: () => {}
    }

    componentDidMount() {
        this.props.onSetUp();
    }

    getTools = () => {
        const tools = [
            {
                name: "urbanisme_nru",
                position: 1,
                priority: 1,
                tool: true,
                plugin: NRU
            },
            {
                name: "urbanisme_ads",
                position: 2,
                priority: 1,
                tool: true,
                plugin: ADS
            },
            {
                name: "urbanisme_help",
                position: 3,
                priority: 1,
                tool: true,
                plugin: ADS
            },
            {
                name: "urbanisme_remove",
                position: 4,
                priority: 1,
                tool: false,
                active: true,
                action: toggleControl.bind(null, CONTROL_NAME, null),
                icon: <Glyphicon glyph="remove" />
            }
        ];
        const combinedItemTools = [...this.props.items, ...tools ];
        const unsorted = combinedItemTools.map((item, index) => assign({}, item, {position: item.position || index}));
        return unsorted.sort((a, b) => a.position - b.position);
    };

    render() {
        const panelStyle = {
            minWidth: "300px",
            right: "450px",
            zIndex: 100,
            position: "absolute",
            overflow: "auto",
            left: "52px",
            top: "52px"
        };

        const btnConfig = {
            className: "square-button"
        };

        return this.props.enabled ? (
            <> <ToolsContainer
                id={CONTROL_NAME}
                className="urbanismeToolbar btn-group-horizontal"
                container={Container}
                toolStyle="primary"
                activeStyle="success"
                panelStyle={panelStyle}
                toolCfg={btnConfig}
                tools={this.getTools()}
                panels={[]} />
            {this.props.showGFIPanel && <LandPlanPanel {...this.props}/>}
            </>
        ) : null;
    }
}

const Urbanisme = connect((state) => ({
    enabled: state.controls && state.controls.urbanisme && state.controls.urbanisme.enabled || false,
    showGFIPanel: state?.urbanisme?.showGFIPanel || false,
    nruData: state?.urbanisme?.nruData,
    adsData: state?.urbanisme?.adsData,
    nruActive: state?.urbanisme?.nruActive,
    adsActive: state?.urbanisme?.adsActive,
    loading: state?.urbanisme?.loadFlags?.dataLoading || false, // Remove loadFlags
    printing: state?.urbanisme?.loadFlags?.printing || false
}), {
    onSetUp: setUp,
    togglePanel: toggleGFIPanel,
    toggleHighlightFeature,
    onPrint: printSpec
})(UrbanismeToolbar);

const UrbanismePluginDefinition = {
    name: "Urbanisme",
    component: Urbanisme,
    containers: {
        BurgerMenu: {
            name: CONTROL_NAME,
            text: <Message msgId="urbanisme.title"/>,
            icon: <Glyphicon glyph="th-list" />,
            action: toggleControl.bind(null, 'urbanisme', null),
            position: 1501,
            doNotHide: true,
            priority: 2
        }
    },
    epics: urbanismeEpic,
    reducers: { urbanisme: urbanismeReducer }
};

export default UrbanismePluginDefinition;
