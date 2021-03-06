/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

export const TOGGLE_NRU = "URBANISME:TOGGLE_NRU";

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
