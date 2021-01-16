/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import * as Rx from 'rxjs';
import {get, isEmpty} from "lodash";

import { TOGGLE_CONTROL, toggleControl } from '@mapstore/actions/controls';
import { error } from '@mapstore/actions/notifications';
import { CLICK_ON_MAP } from '@mapstore/actions/map';
import { addLayer, removeLayer } from '@mapstore/actions/layers';
import { toggleMapInfoState, toggleHighlightFeature, purgeMapInfoResults, featureInfoClick, LOAD_FEATURE_INFO, hideMapinfoMarker, TOGGLE_HIGHLIGHT_FEATURE } from '@mapstore/actions/mapInfo';
import { createControlEnabledSelector, measureSelector } from '@mapstore/selectors/controls';
import { wrapStartStop } from '@mapstore/observables/epics';

import { SET_UP, setConfiguration, loading, setAttributes, toggleUrbanismeTool, toggleGFIPanel } from '../actions/urbanisme';
import { configSelector, urbanismeLayerSelector } from '../selectors/urbanisme';
import { getConfiguration, getCommune, getFIC, getParcelle, getRenseignUrba, getRenseignUrbaInfos, getQuartier, getAdsSecteurInstruction, getAdsAutorisation } from '../api';
import {URBANISME_RASTER_LAYER_ID, URBANISME_LAYER_NAME, URBANISME_TOOLS} from '../constants';

/**
 * Ensures that config for the urbanisme tool is fetched and loaded
 * @memberof epics.urbanisme
 * @param {observable} action$ manages `SET_UP`
 * @return {observable}
 */
export const setUpPluginEpic = (action$, store) =>
    action$.ofType(SET_UP)
        .switchMap(() => {
            const state = store.getState();
            const isConfigLoaded = !!configSelector(state);

            return isConfigLoaded
                ? Rx.Observable.empty()
                : Rx.Observable.defer(() => getConfiguration()).switchMap(data => Rx.Observable.of(setConfiguration(data)));
        });

/**
 * Ensures that when the urbanisme tool is enabled in controls, the urbanisme_parcelle layer is added to map
 * as an overlay and when disabled the layer is removed from the map
 * @memberof epics.urbanisme
 * @param {observable} action$ manages `TOGGLE_CONTROL`
 * @return {observable}
 */
export const toggleLandPlanningEpic =  (action$, store) =>
    action$.ofType(TOGGLE_CONTROL)
        .filter(({ control }) => control === "urbanisme")
        .switchMap(() => {
            const state = store.getState();
            const { cadastreWMSURL } = configSelector(state);
            const enabled = get(state, 'controls.urbanisme.enabled', false);
            const mapInfoEnabled = get(state, 'mapInfo.enabled');
            if (enabled) {
                return Rx.Observable.from([addLayer({
                    id: URBANISME_RASTER_LAYER_ID,
                    type: "wms",
                    name: URBANISME_LAYER_NAME,
                    url: cadastreWMSURL,
                    visibility: true,
                    search: {}
                }),
                toggleHighlightFeature(true)])
                    .concat(mapInfoEnabled ? [toggleMapInfoState()] : []);
            }
            const layer = urbanismeLayerSelector(state);
            return !isEmpty(layer)
                ? Rx.Observable.from([removeLayer(URBANISME_RASTER_LAYER_ID), purgeMapInfoResults()]).concat(!mapInfoEnabled ? [toggleMapInfoState()] : [])
                : Rx.Observable.empty();
        });

/**
 * Ensures that when the clicked on map event triggers, it performs get feature info only when urbanimse_parcelle layers is present
 * @memberof epics.urbanisme
 * @param {observable} action$ manages `CLICK_ON_MAP`
 * @return {observable}
 */
export const clickOnMapEventEpic = (action$, {getState}) =>
    action$.ofType(CLICK_ON_MAP)
        .filter(()=> !isEmpty(urbanismeLayerSelector(getState())))
        .switchMap(({point, layer}) => {
            const state = getState();
            const printing = get(getState(), 'urbanisme.printing', false);
            const activeTool = get(state, 'urbanisme.activeTool');
            const urbanismeEnabled = get(state, 'controls.urbanisme.enabled', false);
            const mapInfoEnabled = get(state, 'mapInfo.enabled', false);
            const isAnnotationsEnabled = createControlEnabledSelector('annotations')(state);
            const isMeasureEnabled = measureSelector(state);

            if (isAnnotationsEnabled || isMeasureEnabled || mapInfoEnabled) {
                return urbanismeEnabled ? Rx.Observable.of(toggleControl('urbanisme')) : Rx.Observable.empty();
            }
            return (!isEmpty(activeTool)) && !printing
                ? Rx.Observable.concat(
                    Rx.Observable.of(toggleHighlightFeature(true)),
                    Rx.Observable.of(featureInfoClick(point, layer), loading(true, 'dataLoading'))
                )
                : Rx.Observable.empty();
        });

/**
 * Ensures that when the urbanisme tool is closed, perform all clean up activity of the plugin
 * @memberof epics.urbanisme
 * @param {observable} action$ manages `TOGGLE_CONTROL`
 * @return {observable}
 */
export const cleanUpUrbanisme = (action$, {getState}) =>
    action$.ofType(TOGGLE_CONTROL)
        .filter(({ control }) => control === "urbanisme" && !get(getState(), 'controls.urbanisme.enabled'))
        .switchMap(()=>{
            const state = getState();
            const activeTool = get(state, 'urbanisme.activeTool');
            const gfiPanelEnabled = get(state, 'urbanisme.showGFIPanel');
            return Rx.Observable.from([
                ...(!isEmpty(activeTool) ? [toggleUrbanismeTool(null)] : []),
                ...(gfiPanelEnabled ? [toggleGFIPanel(false)] : []),
                setAttributes(null),
                toggleHighlightFeature(false)
            ]);
        });

/**
 * Ensures that when the highlight of feature is disabled when map info marker is hidden
 * @memberof epics.urbanisme
 * @param {observable} action$ manages `TOGGLE_HIGHLIGHT_FEATURE`
 * @return {observable}
 */
export const onClosePanelEpic = (action$) =>
    action$.ofType(TOGGLE_HIGHLIGHT_FEATURE)
        .filter(({enabled}) => !enabled)
        .switchMap(()=> Rx.Observable.of(hideMapinfoMarker()));

/**
 * Ensures that when the feature info is loaded it has parcelle data to proceed further to call NRU/ADS data
 * @memberof epics.urbanisme
 * @param {observable} action$ manages `LOAD_FEATURE_INFO`
 * @return {observable}
 */
export const getFeatureInfoClick = (action$, {getState}) =>
    action$.ofType(LOAD_FEATURE_INFO)
        .filter(({layer})=> {
            const printing = get(getState(), 'urbanisme.printing', false); // Check this
            const activeTool = get(getState(), 'urbanisme.activeTool');
            return layer.id === URBANISME_RASTER_LAYER_ID && !printing && !isEmpty(activeTool);
        })
        .switchMap(({layerMetadata})=> {
            const parcelleId = layerMetadata.features?.[0]?.properties?.id_parc || '';
            const activeTool = get(getState(), 'urbanisme.activeTool');
            if (isEmpty(parcelleId)) {
                return Rx.Observable.of(hideMapinfoMarker(), loading(false, 'dataLoading'), setAttributes( null));
            }
            let observable$ = Rx.Observable.empty();
            if (activeTool === URBANISME_TOOLS.NRU) {
                const cgoCommune = parcelleId.slice(0, 6);
                const codeCommune = cgoCommune.substr(0, 2) + cgoCommune.substr(3, 6);
                observable$ = Rx.Observable.forkJoin(
                    getCommune(cgoCommune),
                    getParcelle(parcelleId),
                    getRenseignUrba(parcelleId),
                    getFIC(parcelleId, 0),
                    getFIC(parcelleId, 1),
                    getRenseignUrbaInfos(codeCommune))
                    .switchMap(([commune, parcelle, lisbelle, propPrio, proprioSurf, dates])=>
                        Rx.Observable.of(setAttributes({...commune, ...parcelle, ...lisbelle, ...propPrio, ...proprioSurf, ...dates})));
            } else if (activeTool === URBANISME_TOOLS.ADS) {
                observable$ = Rx.Observable.forkJoin(
                    getAdsSecteurInstruction(parcelleId),
                    getAdsAutorisation(parcelleId),
                    getQuartier(parcelleId))
                    .switchMap(([adsSecteurInstruction, adsAutorisation, quartier])=>
                        Rx.Observable.of(setAttributes({...adsSecteurInstruction, ...adsAutorisation, ...quartier})));
            }
            return observable$
                .startWith(toggleGFIPanel(true))
                .let(wrapStartStop(
                    loading(true, 'dataLoading'),
                    loading(false, 'dataLoading'),
                    e => {
                        console.log(e); // eslint-disable-line no-console
                        return Rx.Observable.of(error({ title: "Error", message: "Unable to fetch data" }), loading(false, 'dataLoading'));
                    }
                ));
        });

export default {
    toggleLandPlanningEpic,
    setUpPluginEpic,
    clickOnMapEventEpic,
    getFeatureInfoClick,
    onClosePanelEpic,
    cleanUpUrbanisme
};
