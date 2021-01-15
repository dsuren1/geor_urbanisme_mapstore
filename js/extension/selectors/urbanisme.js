/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import { getLayerFromId } from '@mapstore/selectors/layers';

import { URBANISME_RASTER_LAYER_ID } from '../constants';

export const configSelector = (state) => state?.urbanisme?.config;

export const activeSelector = (state) => state?.urbanisme?.activeTool;

export const nruActiveStateSelector = state => state?.urbanisme.nruActive || false;

export const adsActiveStateSelector = state => state?.urbanisme.adsActive || false;

export const configLoadingState = state => state?.urbanisme?.loadFlags?.config || false;

export const urbanismeLayerSelector = (state) => getLayerFromId(state, URBANISME_RASTER_LAYER_ID);
