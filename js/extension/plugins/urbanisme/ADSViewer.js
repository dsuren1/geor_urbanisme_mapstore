import React from 'react';
import isEmpty from 'lodash/isEmpty';

const AdsViewer = ({id_parcelle = '', nom = '', ini_instru = '', num_dossier = [], num_nom = ''}) => {
    return (
        <div className="parcelle">
            <h2>Eléments d\'informations applicables à la parcelle cadastrale</h2>
            <h3>{id_parcelle}</h3>
            <h3>Secteur d\'instruction :</h3>
            {!isEmpty(nom) && !isEmpty(ini_instru) ? <span>Aucun secteur d\'instruction ne correspond à la localisation de la parcelle</span>
                : <span>{nom} / {ini_instru}</span>
            }
            <h3>Liste des ADS :</h3>
            <ul>
                {num_dossier.map(n=> <li>{n}</li>)}
            </ul>
            <h3>Quartier :</h3>
            {num_nom ? <span>Aucun quartier ne correspond à la localisation de la parcelle</span> : <p>{num_nom}</p>}
        </div>
    );
};

export default AdsViewer;
