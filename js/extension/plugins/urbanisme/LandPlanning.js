import React from 'react';
import {Glyphicon} from 'react-bootstrap';
import isEmpty from 'lodash/isEmpty';
import Spinner from 'react-spinkit';
import Dialog from '@mapstore/components/misc/Dialog';
import Button from '@mapstore/components/misc/Button';
import Loader from '@mapstore/components/misc/Loader';
import NRUViewer from './NRUViewer';
import ADSViewer from './ADSViewer';

const LandPlanning = ({togglePanel, toggleHighlightFeature, nruData, nruActive, adsActive, adsData, loading, printing, onPrint}) => {
    const closePanel = () => { togglePanel(false); toggleHighlightFeature(false);};

    const viewer = () => {
        if (nruActive) {
            return isEmpty(nruData) ? <p>No NRU data to display</p> : <NRUViewer {...nruData}/>;
        } else if (adsActive) {
            return isEmpty(adsData) ? <p>No NRU data to display</p> : <ADSViewer {...adsData}/>;
        }
        return null;
    };

    return (<Dialog id={"bookmark-panel-dialog"} draggable modal={false}>
        <span role="header" style={{display: "flex", justifyContent: "space-between"}}>
            <span>Land Planning</span>
            <button onClick={closePanel} className="close"> <Glyphicon glyph="1-close"/></button>
        </span>
        <div role="body" style={{...(!loading && {maxHeight: 400, overflow: 'auto'})}}>
            {loading ? <Loader size={100} style={{margin: '0 auto'}}/> : viewer() }
        </div>
        <span role="footer">
            <Button disabled={loading || isEmpty(nruData) || printing} onClick={onPrint} bsStyle="primary">
                {printing ? <Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner" /> : null}
                     Print
            </Button>
            <Button disabled={loading} onClick={closePanel} bsStyle="primary">
                    Cancel
            </Button>
        </span>
    </Dialog>);
};

export default LandPlanning;
