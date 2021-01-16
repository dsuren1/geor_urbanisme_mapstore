import React from 'react';
import {Table} from 'react-bootstrap';

const NRUInfo = ({
    parcelle = '', commune = '', libelles = [], ...props}) => {

    const tableData = {
        Section: props.codeSection || '',
        "Numéro parcelle": props.numero || '',
        "Adresse cadastrale": props.adresseCadastrale || '',
        "Contenance DGFiP (m²)": props.contenanceDGFiP || '',
        "Surface calculée (m²)": props.surfaceSIG || '',
        "Compte propriétaire": props.codeProprio || '',
        "Propriétaire(s)": props.nomProprio || '',
        "Date de production des RU": props.dateRU || '',
        "Millésime du cadastre": props.datePCI || ''
    };

    return (
        <div className="parcelle">
            <h2>Réglementation applicable à la parcelle cadastrale</h2>
            <h3>{parcelle}</h3>
            <Table className="table-parcelle">
                <thead>
                    <tr>
                        <td className="parcelle-table-label">Commune</td>
                        <td className="parcelle-table-value">{commune}</td>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(tableData).map(key=> {
                        return (<tr>
                            <td className="parcelle-table-label">{key}</td>
                            <td className="parcelle-table-value">{tableData[key]}</td>
                        </tr>);
                    })}
                </tbody>
            </Table>
            <div>
                {libelles.map(libelle=> <p className="libelle">{libelle}</p>)}
            </div>
        </div>
    );
};

export default NRUInfo;
