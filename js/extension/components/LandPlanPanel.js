import React from 'react';
import {Glyphicon} from 'react-bootstrap';
import isEmpty from 'lodash/isEmpty';
import Spinner from 'react-spinkit';
import Dialog from 'mapstore2/web/client/components/misc/Dialog';
import Button from 'mapstore2/web/client/components/misc/Button';
import Loader from 'mapstore2/web/client/components/misc/Loader';
import NRUViewer from './NRUViewer';
import ADSViewer from './ADSViewer';

const LandPlanPanel = ({togglePanel, toggleHighlightFeature, nruData, nruActive, adsActive, adsData, loading, printing, onPrint}) => {
    const closePanel = () => { togglePanel(false); toggleHighlightFeature(false);};

    const viewer = () => {
        if (nruActive) {
            return isEmpty(nruData) ? <p>No NRU data to display</p> : <NRUViewer {...nruData}/>;
        } else if (adsActive) {
            return isEmpty(adsData) ? <p>No ADS data to display</p> : <ADSViewer {...adsData}/>;
        }
        return null;
    };

    const onSubmitPrint = () => {
        let attributes = {};
        if (nruActive) {
            attributes = {
                parcelle: nruData.parcelle || '',
                commune: nruData.commune || '',
                codeSection: nruData.codeSection || '',
                numero: nruData.numero || '',
                adresseCadastrale: nruData.adresseCadastrale || '',
                contenanceDGFiP: nruData.contenanceDGFiP || '',
                surfaceSIG: nruData.surfaceSIG || '',
                codeProprio: nruData.codeProprio || '',
                nomProprio: nruData.nomProprio || '',
                adresseProprio: nruData.adresseProprio || '',
                dateRU: nruData.dateRU || '',
                datePCI: nruData.datePCI || '',
                libelles: (nruData.libelles || []).join("\n\n") || [],
                outputFilename: "NRU_" + nruData.parcelle
            };
        } else if (adsActive) {
            const parcelle = adsData.id_parcelle || '';
            attributes = {
                layout: "A4 portrait ADS",
                instruction: isEmpty(adsData.nom) && isEmpty(adsData.ini_instru)
                    ? "Aucun secteur d'instruction ne correspond à la localisation de la parcelle" : adsData.nom + " / " + adsData.ini_instru,
                parcelle,
                numNom: isEmpty(adsData.num_nom) ? 'Aucun quartier ne correspond à la localisation de la parcelle' : adsData.num_nom,
                numDossier: (adsData.num_dossier || []).join("\n\n"),
                outputFilename: "ADS_" + parcelle
            };
        }
        onPrint(attributes);
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
            <Button disabled={loading || (isEmpty(nruData) && isEmpty(adsData)) || printing} onClick={onSubmitPrint} bsStyle="primary">
                {printing ? <Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner" /> : null}
                     Print
            </Button>
            <Button disabled={loading} onClick={closePanel} bsStyle="primary">
                    Cancel
            </Button>
        </span>
    </Dialog>);
};

export default LandPlanPanel;
