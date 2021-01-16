import React from 'react';
import isEmpty from 'lodash/isEmpty';
import {ADS_DEFAULTS} from "@js/extension/constants";

const ADSInfo = ({id_parcelle = '', nom = '', ini_instru = '', num_dossier = [], num_nom = ''}) => {
    const {parcelle, emptyNom, emptyNumNom, secteur} = ADS_DEFAULTS;

    return (
        <div className="parcelle">
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
            {isEmpty(num_nom) ? <span>{emptyNumNom}</span> : <p>{num_nom}</p>}
        </div>
    );
};

export default ADSInfo;
