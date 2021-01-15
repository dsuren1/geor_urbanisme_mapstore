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

import { adsActiveStateSelector } from '../../selectors/urbanisme';
import { toggleADS } from '../../actions/urbanisme';

const ADSButton = (props) => {
    const {
        tooltip,
        tooltipPlacement = "left",
        onToggleADS = () => {},
        adsActive } = props;
    const id = "ads";
    return (
        <OverlayTrigger
            placement={tooltipPlacement}
            key={"overlay-trigger." + id}
            overlay={<Tooltip id={id + "_tooltip"}>{tooltip}</Tooltip>}
        >
            <Button id={id + "_btn"} disabled={false} className="square-button" onClick={onToggleADS} bsStyle={adsActive ? "success" : "primary"}>
                <Glyphicon glyph="info-sign" />
            </Button>
        </OverlayTrigger>
    );
};

const ADS = connect((state) => ({
    adsActive: adsActiveStateSelector(state),
    tooltip: "ADS"
}), {
    onToggleADS: toggleADS
})(ADSButton);

export default ADS;
