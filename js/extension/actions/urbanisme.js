/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/


export * from './setUp';
export * from './nru';
export * from './ads';

export const TOGGLE_TOOL = "URBANISME:TOGGLE_TOOL";

export const toggleTool = (tool) =>{
    return {
        type: TOGGLE_TOOL,
        activeTool: tool
    };
};
