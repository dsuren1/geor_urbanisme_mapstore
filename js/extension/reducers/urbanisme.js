/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import { set } from '@mapstore/utils/ImmutableUtils';

import {
    SET_CONFIG,
    TOGGLE_NRU,
    LOADING,
    TOGGLE_NRU_GFI_PANEL,
    SET_NRU_DATA,
    TOGGLE_ADS,
    SET_ADS_DATA,
    TOGGLE_TOOL
} from '../actions/urbanisme';

const initialState = {
    nruActive: false
};

export default function urbanisme(state = initialState, action) {
    switch (action.type) {
    case SET_CONFIG:
        return set('config', action.config, state);
    case TOGGLE_NRU:
        return set('nruActive', !state.nruActive, state);
    case TOGGLE_TOOL:
        return set('activeTool', !state.nruActive, state);
    case TOGGLE_ADS:
        return set('adsActive', !state.adsActive, state);
    case LOADING: {
        return set(action.name === "loading" ? "loading" : `loadFlags.${action.name}`, action.value, set(
            "loading", action.value, state
        ));
    }
    case TOGGLE_NRU_GFI_PANEL: {
        return set('showGFIPanel', action.enabled, state);
    }
    case SET_NRU_DATA: {
        return {...state, nruData: action.property};
    }
    case SET_ADS_DATA: {
        return {...state, adsData: action.property};
    }
    default:
        return state;
    }
}
