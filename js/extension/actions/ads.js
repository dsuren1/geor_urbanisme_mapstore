import axios from '@mapstore/libs/ajax';
import {isEmpty} from "lodash";

export const TOGGLE_ADS = "URBANISME:TOGGLE_ADS";
export const SET_ADS_DATA = "URBANISME:SET_ADS_DATA";

/**
 * Toggles the state of the NRU tool
 * @memberof actions.nru
 * @return {object} with type `TOGGLE_NRU`
 */
export const toggleADS = () => {
    return {
        type: TOGGLE_ADS
    };
};

export const setADSProperty = (property = {}) => {
    return {
        type: SET_ADS_DATA,
        property
    };
};

export const getAdsSecteurInstruction = (parcelle) => {
    return axios.get('/urbanisme/adsSecteurInstruction', {params: {parcelle}}).then(({data})=> {
        if (isEmpty(data)) {
            return null;
        }
        return {nom: data.nom, ini_instru: data.ini_instru};
    });
};

export const getAdsAutorisation = (parcelle) => {
    return axios.get('/urbanisme/adsAutorisation', {params: {parcelle}}).then(({data})=> {
        if (isEmpty(data)) {
            return null;
        }
        const {numdossier = []} = data;
        const ads = "Aucun ADS trouvé pour la parcelle";
        if (isEmpty(numdossier)) {
            return {num_dossier: [ads]};
        }
        return {num_dossier: numdossier.map(({numdossier: numData})=> numData)};
    });
};

export const getQuartier = (parcelle) => {
    return axios.get('/urbanisme/quartier', {params: {parcelle}}).then(({data}) => {
        if (isEmpty(data)) {
            return null;
        }
        return {num_nom: data.numnom, id_parcelle: data.parcelle};
    });
};
