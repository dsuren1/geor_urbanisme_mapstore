/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import isEmpty from 'lodash/isEmpty';
import {ADS_DEFAULTS} from "@js/extension/constants";

/**
 * ADSInfo component
 * @param {object} props Component props
 * @param {object} props object containing attributes of ADS data
 */
const ADSInfo = ({id_parcelle = '', nom = '', ini_instru = '', num_dossier = [], num_nom = ''}) => {
    const {parcelle, emptyNom, emptyNumNom, secteur} = ADS_DEFAULTS;

    return (
        <div className="parcelle_ads">
            <h2>{parcelle}</h2>
            <h3>{id_parcelle}</h3>
            <h3>{secteur}</h3>
            {isEmpty(nom) && isEmpty(ini_instru) ? <span>{emptyNom}</span>
                : <span>{nom} / {ini_instru}</span>
            }
            <h3>Liste des ADS :</h3>
            <ul>
                {num_dossier.map(n=> <li>{n}</li>)}
            </ul>
            <h3>Quartier :</h3>
            {isEmpty(num_nom) ? <p>{emptyNumNom}</p> : <p>{num_nom}</p>}
        </div>
    );
};

export default ADSInfo;
