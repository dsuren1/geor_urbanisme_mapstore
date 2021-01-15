/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { connect } from 'react-redux';
import { Glyphicon, Tooltip } from 'react-bootstrap';

import Button from '@mapstore/components/misc/Button';
import OverlayTrigger from '@mapstore/components/misc/OverlayTrigger';

import {activeSelector, nruActiveStateSelector} from '../../selectors/urbanisme';
import { toggleNru } from '../../actions/urbanisme';

const UrabinsmeButton = (props) => {
    const {
        tooltip,
        tooltipPlacement = "left",
        onToggleNru = () => {},
        nruActive } = props;
    const id = "nru";
    return (
        <OverlayTrigger
            placement={tooltipPlacement}
            key={"overlay-trigger." + id}
            overlay={<Tooltip id={id + "_tooltip"}>{tooltip}</Tooltip>}
        >
            <Button id={id + "_btn"} disabled={false} className="square-button" onClick={onToggleNru} bsStyle={nruActive ? "success" : "primary"}>
                <Glyphicon glyph="zoom-to" />
            </Button>
        </OverlayTrigger>
    );
};

const Urbanisme = connect((state) => ({
    activeTool: activeSelector(state)
}), {
    onToggleNru: toggleNru
})(UrabinsmeButton);

export default Urbanisme;
