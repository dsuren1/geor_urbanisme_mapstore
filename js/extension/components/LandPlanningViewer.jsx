import React from 'react';
import {Glyphicon} from 'react-bootstrap';
import isEmpty from 'lodash/isEmpty';
import Spinner from 'react-spinkit';
import Dialog from '@mapstore/components/misc/Dialog';
import Button from '@mapstore/components/misc/Button';
import Loader from '@mapstore/components/misc/Loader';
import NRUInfo from './NRUInfo';
import ADSInfo from './ADSInfo';
import {ADS_DEFAULTS, URBANISME_TOOLS} from "@js/extension/constants";

/**
 * LandPlanningViewer component
 * @param {object} props Component props
 * @param {object} props.urbanisme object containing attributes of NRU/ADS data
 * @param {func} props.togglePanel triggered on closing the LandPlanning viewer panel
 * @param {func} props.toggleHighlightFeature triggered on closing the LandPlanning viewer panel
 * @param {func} props.onPrint triggered on printing the NRU/ADS attributes to PDF
 *
 */
const LandPlanningViewer = ({urbanisme, togglePanel, toggleHighlightFeature, onPrint}) => {
    const {attributes = {}, activeTool, dataLoading: loading, printing} = urbanisme;
    const printDisabled = loading || isEmpty(attributes) || printing;
    const { NRU, ADS } = URBANISME_TOOLS;

    const closePanel = () => { togglePanel(false); toggleHighlightFeature(false);};

    const Viewer = () => {
        if (isEmpty(attributes)) return (<p>No data to display</p>);
        if (activeTool === NRU) {
            return <NRUInfo {...attributes}/>;
        } else if (activeTool === ADS) {
            return <ADSInfo {...attributes}/>;
        }
        return null;
    };

    const onSubmitPrint = () => {
        let paramAttributes = {};
        if (activeTool === NRU) {
            paramAttributes = {
                parcelle: attributes.parcelle || '',
                commune: attributes.commune || '',
                codeSection: attributes.codeSection || '',
                numero: attributes.numero || '',
                adresseCadastrale: attributes.adresseCadastrale || '',
                contenanceDGFiP: attributes.contenanceDGFiP || '',
                surfaceSIG: attributes.surfaceSIG || '',
                codeProprio: attributes.codeProprio || '',
                nomProprio: attributes.nomProprio || '',
                adresseProprio: attributes.adresseProprio || '',
                dateRU: attributes.dateRU || '',
                datePCI: attributes.datePCI || '',
                libelles: (attributes.libelles || []).join("\n\n") || [],
                outputFilename: "NRU_" + attributes.parcelle
            };
        } else if (activeTool === ADS) {
            const {emptyNom, emptyNumNom} = ADS_DEFAULTS;
            const parcelle = attributes.id_parcelle || '';
            paramAttributes = {
                layout: "A4 portrait ADS",
                instruction: isEmpty(attributes.nom) && isEmpty(attributes.ini_instru)
                    ? emptyNom : attributes.nom + " / " + attributes.ini_instru,
                parcelle,
                numNom: isEmpty(attributes.num_nom) ? emptyNumNom : attributes.num_nom,
                numDossier: (attributes.num_dossier || []).join("\n\n"),
                outputFilename: "ADS_" + parcelle
            };
        }
        onPrint(paramAttributes);
    };

    return (<Dialog id={"modal-land-panel-dialog"}>
        <span role="header" style={{display: "flex", justifyContent: "space-between"}}>
            <span>Land Planning</span>
            <button onClick={closePanel} className="close"> <Glyphicon glyph="1-close"/></button>
        </span>
        <div role="body" style={{...(!loading && {maxHeight: 400, overflow: 'auto'})}}>
            {loading ? <Loader size={100} style={{margin: '0 auto'}}/> : <Viewer/> }
        </div>
        <span role="footer">
            <Button disabled={printDisabled} onClick={onSubmitPrint} bsStyle="primary">
                {printing ? <Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner" /> : null}
                Print
            </Button>
            <Button disabled={loading} onClick={closePanel} bsStyle="primary">Cancel</Button>
        </span>
    </Dialog>);
};

export default LandPlanningViewer;
