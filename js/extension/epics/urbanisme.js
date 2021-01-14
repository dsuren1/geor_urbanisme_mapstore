/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import * as Rx from 'rxjs';

import { TOGGLE_CONTROL, toggleControl } from '@mapstore/actions/controls';
import { error } from '@mapstore/actions/notifications';
import { toggleMapInfoState, toggleHighlightFeature, purgeMapInfoResults, featureInfoClick, LOAD_FEATURE_INFO, hideMapinfoMarker, TOGGLE_HIGHLIGHT_FEATURE } from '@mapstore/actions/mapInfo';
import { addLayer, removeLayer } from '@mapstore/actions/layers';
import { CLICK_ON_MAP } from '@mapstore/actions/map';
import { wrapStartStop } from '@mapstore/observables/epics';

import { createControlEnabledSelector, measureSelector } from '@mapstore/selectors/controls';
import {SET_UP, setConfiguration, loading, setNRUProperty,
    toggleNru, getCommune, getFIC, getParcelle, getRenseignUrba, getRenseignUrbaInfos, toggleGFIPanel} from '../actions/urbanisme';
import { configSelector, urbanismeLayerSelector } from '../selectors/urbanisme';
import { getConfiguration } from '../api';
import { URBANISME_RASTER_LAYER_ID, URBANISME_LAYER_NAME } from '../constants';
import {get, isEmpty} from "lodash";

/**
 * Ensures that config for the urbanisme tool is fetched and loaded
 * @memberof epics.urbanisme
 * @param {external:Observable} action$ manages `SET_UP`
 * @return {external:Observable}
 */
export const setUpPluginEpic = (action$, store) =>
    action$.ofType(SET_UP)
        .switchMap(() => {
            const state = store.getState();
            const isConfigLoaded = !!configSelector(state);

            return isConfigLoaded
                ? Rx.Observable.empty()
                : Rx.Observable.defer(() => getConfiguration())
                    .switchMap(data => {
                        return Rx.Observable.of(setConfiguration(data));
                    }).let(
                        wrapStartStop(
                            loading(true, 'config'),
                            loading(false, 'config'),
                            e => {
                                console.log(e); // eslint-disable-line no-console
                                return Rx.Observable.of(error({ title: "Error", message: "Unable to setup urbanisme config" }), loading(false, 'config'));
                            }
                        )
                    );
        });

/**
 * Ensures that when the urbanisme tool is enabled in controls, the urbanisme_parcelle layer is added to map
 * as an overlay and when disabled the layer is removed from the map
 * @memberof epics.urbanisme
 * @param {external:Observable} action$ manages `TOGGLE_CONTROL`
 * @return {external:Observable}
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

export const mouseMoveMapEventEpic = (action$, {getState}) =>
    action$.ofType(CLICK_ON_MAP)
        .filter(()=> !isEmpty(urbanismeLayerSelector(getState())))
        .switchMap(({point, layer}) => {
            const state = getState();
            const printing = get(getState(), 'urbanisme.loadFlags.printing', false);
            const nruEnabled = get(state, 'urbanisme.nruActive', false);
            const urbanismeEnabled = get(state, 'controls.urbanisme.enabled', false);
            const mapInfoEnabled = get(state, 'mapInfo.enabled', false);
            const isAnnotationsEnabled = createControlEnabledSelector('annotations')(state);
            const isMeasureEnabled = measureSelector(state);

            if (isAnnotationsEnabled || isMeasureEnabled || mapInfoEnabled) {
                return urbanismeEnabled ? Rx.Observable.of(toggleControl('urbanisme')) : Rx.Observable.empty();
            }
            return nruEnabled && !printing
                ? Rx.Observable.concat(
                    Rx.Observable.of(toggleHighlightFeature(true)),
                    Rx.Observable.of(featureInfoClick(point, layer), loading(true, 'nruLoading'))
                )
                : Rx.Observable.empty();
        });

export const cleanUpUrbanisme = (action$, {getState}) =>
    action$.ofType(TOGGLE_CONTROL)
        .filter(({ control }) => control === "urbanisme" && !get(getState(), 'controls.urbanisme.enabled'))
        .switchMap(()=>{
            const state = getState();
            const nruEnabled = get(state, 'urbanisme.nruActive');
            const gfiPanelEnabled = get(state, 'urbanisme.showGFIPanel');
            return Rx.Observable.from([
                ...(nruEnabled ? [toggleNru()] : []),
                ...(gfiPanelEnabled ? [toggleGFIPanel(false)] : []),
                setNRUProperty(null)
            ]);
        });
export const onClosePanelEpic = (action$) =>
    action$.ofType(TOGGLE_HIGHLIGHT_FEATURE)
        .filter(({enabled}) => !enabled)
        .switchMap(()=> Rx.Observable.of(hideMapinfoMarker()));

export const getFeatureInfoClick = (action$, {getState}) =>
    action$.ofType(LOAD_FEATURE_INFO)
        .filter(({layer})=> {
            const printing = get(getState(), 'urbanisme.loadFlags.printing', false);
            const nruActive = get(getState(), 'urbanisme.nruActive', false);
            return layer.id === URBANISME_RASTER_LAYER_ID && !printing && nruActive;
        })
        .switchMap(({layerMetadata})=> {
            const parcelleId = layerMetadata.features?.[0]?.properties?.id_parc || '';
            if (isEmpty(parcelleId)) {
                return Rx.Observable.of(hideMapinfoMarker(), loading(false, 'nruLoading'), setNRUProperty( null));
            }
            const cgoCommune = parcelleId.slice(0, 6);
            const codeCommune = cgoCommune.substr(0, 2) + cgoCommune.substr(3, 6);
            return Rx.Observable.forkJoin(
                getCommune(cgoCommune),
                getParcelle(parcelleId),
                getRenseignUrba(parcelleId),
                getFIC(parcelleId, 0),
                getFIC(parcelleId, 1),
                getRenseignUrbaInfos(codeCommune))
                .switchMap(([commune, parcelle, lisbelle, propPrio, proprioSurf, dates])=>
                    Rx.Observable.of(setNRUProperty({...commune, ...parcelle, ...lisbelle, ...propPrio, ...proprioSurf, ...dates})))
                .startWith(toggleGFIPanel(true))
                .let(wrapStartStop(
                    loading(true, 'nruLoading'),
                    loading(false, 'nruLoading'),
                    e => {
                        console.log(e); // eslint-disable-line no-console
                        return Rx.Observable.of(error({ title: "Error", message: "Unable to fetch NRU data" }), loading(false, 'nruLoading'));
                    }
                ));
        });

export default {
    toggleLandPlanningEpic,
    setUpPluginEpic,
    mouseMoveMapEventEpic,
    getFeatureInfoClick,
    onClosePanelEpic,
    cleanUpUrbanisme
};
