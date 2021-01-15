import React from 'react';
import {Table} from 'react-bootstrap';

const NRUViewer = ({
    parcelle = '', commune = '', codeSection = '', numero = '', adresseCadastrale = '',
    contenanceDGFiP = '', surfaceSIG = '', codeProprio = '', nomProprio = '', dateRU = '', datePCI = '', libelles = []}) => {
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
                    <tr>
                        <td className="parcelle-table-label">Section</td>
                        <td className="parcelle-table-value">{codeSection}</td>
                    </tr>
                    <tr>
                        <td className="parcelle-table-label">Numéro parcelle</td>
                        <td className="parcelle-table-value">{numero}</td>
                    </tr>
                    <tr>
                        <td className="parcelle-table-label">Adresse cadastrale</td>
                        <td className="parcelle-table-value">{adresseCadastrale}</td>
                    </tr>
                    <tr>
                        <td className="parcelle-table-label">Contenance DGFiP (m²)</td>
                        <td className="parcelle-table-value">{contenanceDGFiP}</td>
                    </tr>
                    <tr>
                        <td className="parcelle-table-label">Surface calculée (m²)</td>
                        <td className="parcelle-table-value">{surfaceSIG}</td>
                    </tr>
                    <tr>
                        <td className="parcelle-table-label">Compte propriétaire</td>
                        <td className="parcelle-table-value">{codeProprio}</td>
                    </tr>
                    <tr>
                        <td className="parcelle-table-label">Propriétaire(s)</td>
                        <td className="parcelle-table-value">{nomProprio}</td>
                    </tr>
                    <tr>
                        <td className="parcelle-table-label">Date de production des RU</td>
                        <td className="parcelle-table-value">{dateRU}</td>
                    </tr>
                    <tr>
                        <td className="parcelle-table-label">Millésime du cadastre</td>
                        <td className="parcelle-table-value">{datePCI}</td>
                    </tr>
                </tbody>
            </Table>
            <div>
                {libelles.map(libelle=> <p className="libelle">{libelle}</p>)}
            </div>
        </div>
    );
};

export default NRUViewer;
