/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import axios from '@mapstore/libs/ajax';
import {isEmpty, includes} from "lodash";
import {BASE_URL} from "../api";
import {printError} from "@mapstore/actions/print";
import { getNearestZoom, getMapfishLayersSpecification } from "@mapstore/utils/PrintUtils";
import {URBANISME_RASTER_LAYER_ID} from "@js/extension/constants";
import { getScales } from '@mapstore/utils/MapUtils';
import { reproject } from '@mapstore/utils/CoordinatesUtils';
import { layerSelectorWithMarkers } from '@mapstore/selectors/layers';
import { saveAs } from 'file-saver';
import {loading} from "@js/extension/actions/setUp";

export const TOGGLE_NRU = "URBANISME:TOGGLE_NRU";
export const TOGGLE_NRU_GFI_PANEL = "URBANISME:TOGGLE_NRU_GFI_PANEL";
export const SET_NRU_DATA = "URBANISME:SET_NRU_DATA";

/**
* Toggles the state of the NRU tool
* @memberof actions.nru
* @return {object} with type `TOGGLE_NRU`
*/
export const toggleNru = () => {
    return {
        type: TOGGLE_NRU
    };
};

export const toggleGFIPanel = (enabled) => {
    return {
        type: TOGGLE_NRU_GFI_PANEL,
        enabled
    };
};

export const setNRUProperty = (property = {}) => {
    return {
        type: SET_NRU_DATA,
        property
    };
};

export const getCommune = (cgocommune) => {
    return axios.get(`${BASE_URL}/getCommune`, {params: {cgocommune}}).then(({data}) => {
        const [{libcom_min: commune}] = data;
        return {commune};
    });
};

export const getParcelle = (code) => {
    return axios.get(`${BASE_URL}/getParcelle`, {params: {parcelle: code}}).then(({data}) => {
        if (!isEmpty(data)) {
            const [{parcelle, ccopre, ccosec, dnupla: numero, dnvoiri, cconvo, dvoilib, dcntpa: contenanceDGFiP}] = data;
            let parcelleObj = {parcelle, numero, contenanceDGFiP};
            if (ccopre !== "000") {
                parcelleObj.codeSection =  ccopre + ccosec;
            } else {
                parcelleObj.codeSection =  ccosec;
            }
            if (dnvoiri || cconvo || dvoilib) {
                parcelleObj.adresseCadastrale = dnvoiri + " " + cconvo + " " + dvoilib;
            } else {
                parcelleObj.adresseCadastrale = '';
            }
            return parcelleObj;
        }
        return null;
    });
};

export const getRenseignUrba = (parcelle) => {
    return axios.get(`/urbanisme/renseignUrba`, {params: {parcelle}}).then(({data}) => {
        return {libelles: (data?.libelles || []).map(({libelle})=> libelle)};
    });
};

export const getFIC = (parcelle, onglet) => {
    return axios.get(`${BASE_URL}/getFIC`, {params: {parcelle, onglet}}).then(({data}) => {
        if (isEmpty(data)) {
            return null;
        }
        const [record] = data;
        if (onglet === 0) {
            let appNomUsage = data.map(({app_nom_usage}) => app_nom_usage);
            let parcelleObj = {
                nomProprio: appNomUsage.join(", ")
            };
            const {comptecommunal: codeProprio, dlign4 = '', dlign5 = '', dlign6 = ''} = record || {};
            const adresseProprio = dlign4.trim() + " " + dlign5.trim() + " " + dlign6.trim();
            return {...parcelleObj, codeProprio, adresseProprio };
        }
        return {surfaceSIG: record?.surfc || '' };
    });
};

export const getRenseignUrbaInfos = (code) => {
    return axios.get('/urbanisme/renseignUrbaInfos', {params: {code_commune: code}}).then(({data}) => {
        if (isEmpty(data)) {
            return null;
        }
        return {datePCI: data.date_pci.slice(3, 10), dateRU: data.date_ru};
    });
};

const retryDownload = (response, fileName, retries = 10) => {
    return axios.get(response.data.statusURL).then(res=>{
        const done = typeof res.data === "object" && res.data?.done || false;
        if (done) {
            return axios.get(response.data.downloadURL, {responseType: "blob"}).then(({data: pdfBlob})=>{
                return saveAs(pdfBlob, fileName + ".pdf");
            });
        }
        if (retries > 0) {
            return retryDownload(response, fileName, retries - 1);
        }
        throw new Error(res);
    });
};

const getUrbanismePrintSpec = (state) => {
    const {print = {}, map = {}, layers} = state || {};
    const spec = print?.spec && {...print.spec, ...print.map || {}};
    const dpi = spec?.resolution || 96;
    const newMap = map.present || {};
    const projection = newMap.projection || {};
    const scales = getScales();
    const scaleForZoom = scales[getNearestZoom(newMap.zoom, scales)];
    const layersFiltered = layers.flat.filter(l=> (l.group === 'background' && l.visibility && !l.loadingError) || (l.id === URBANISME_RASTER_LAYER_ID) );
    const projectedCenter = reproject(newMap.center, 'EPSG:4326', projection);

    // Only first feature is shown in NRU in ADS
    const clickedPointFeatures = layerSelectorWithMarkers(state).filter(l=> l.name === "GetFeatureInfoHighLight" && includes(l.features[0].id, 'urbanisme_parcelle'));

    // Update layerSpec to suit Urbanisme print spec
    let layerSpec = getMapfishLayersSpecification([...layersFiltered, ...clickedPointFeatures], spec, 'map') || [];
    layerSpec = layerSpec.map(({singleTile, extension, format, styles, styleProperty, ...layer})=> (
        {...layer,
            ...(!isEmpty(extension) && {"imageExtension": extension}),
            ...(!isEmpty(format) && {"imageFormat": format}),
            ...(!isEmpty(styles) && styleProperty && layer.type === 'Vector' && {
                style: {...styles, styleProperty, "Polygon": {...styles.Polygon, strokeDashstyle: "solid"}},
                geoJson: {...layer.geoJson, features: (layer.geoJson.features || []).map(({style, ...ft})=> ({...ft}))}
            })
        })).reverse();
    return {layers: layerSpec, scaleForZoom, projectedCenter, dpi, projection};
};

export const printSpec = (attributes) => {
    return (dispatch, getState) => {
        const state = getState() || {};
        const {outputFilename, layout = 'A4 portrait', ...dataAttributes} = attributes || {};
        const {layers, scaleForZoom, projectedCenter, dpi, projection} = getUrbanismePrintSpec(state);
        const params = {
            layout,
            outputFilename,
            attributes: {
                map: {
                    scale: scaleForZoom,
                    center: [projectedCenter.x, projectedCenter.y],
                    dpi,
                    layers,
                    projection
                },
                ...dataAttributes
            }
        };
        dispatch(loading(true, 'printing'));
        return axios.post('/urbanisme/print/report.pdf', params).then((response) =>{
            if (typeof response.data === 'object') {
                return retryDownload(response, outputFilename).then(()=> dispatch(loading(false, 'printing')))
                    .catch(e=> dispatch(printError('Error on reading print result: ' + e.data), loading(false, 'dataLoading')));
            }
            dispatch(loading(false, 'printing'));
            return null;
        }).catch(e => {
            dispatch(printError('Error on printing: ' + e.data));
        });
    };
};
