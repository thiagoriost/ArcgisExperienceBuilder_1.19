/** 
    Componente para implementación diálogos del sistema    
    @date 2025-04-02
    @author IGAC - DIP    
    @dateUpdated 2025-08-12
    @changes Importación estilos componente ppal
    @remarks Sección de importación
*/

import { React } from "jimu-core";

import { Alert, Modal, ModalHeader, ModalBody, ModalFooter, Icon } from 'jimu-ui'; // import components

import '../../styles/style.css';

/**
 * Sección procesamiento widget => Componente dialogsSrcSIEC correspondiente a la implementación de interfaz gráfica, componentes Alert y Modal
 * @date 2024-06-25
 * @author IGAC - DIP
 * @param {string} msg: Mensaje principal para el modal  
 * @param {any} setAlertDial: Método para asignar al objeto alertDial  
 * @param {string} mensModal: Objeto que contiene el mensaje para visualizar en el componente modal.
 * @param {any} setMensModal: Método para asignar al objeto mensModal
 * @param {string} classCss
 * @dateUpdated 2025-08-12
 * @changes inclusión @param classCss, el cual aplica una clase css asociada al modal.
 * @remarks método traido del API en URL https://developers.arcgis.com/experience-builder/storybook/?path=/docs/components-jimu-ui-index-modal--docs 
 * @remarks Método traido del visor geográfico REFA
 */

const dialogsSrcSIEC = function({setAlertDial, mensModal, setMensModal, classCss}){

    return (
        <div>
            <Modal          
                toggle={function (e){
                    console.log("Haciendo clic por fuera del modal...=>",e);
                    console.log("Class CSS asociada =>",classCss);
                    setMensModal({...mensModal, deployed:false})
                }}
                isOpen={mensModal.deployed}
                className={classCss}                
            >
            <ModalHeader
                closeIcon={<Icon icon="<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; fill=&quot;none&quot; viewBox=&quot;0 0 16 16&quot;><path fill=&quot;#000&quot; d=&quot;m8.745 8 6.1 6.1a.527.527 0 1 1-.745.746L8 8.746l-6.1 6.1a.527.527 0 1 1-.746-.746l6.1-6.1-6.1-6.1a.527.527 0 0 1 .746-.746l6.1 6.1 6.1-6.1a.527.527 0 0 1 .746.746z&quot;></path></svg>" />}
                toggle={function (e){ setMensModal({...mensModal, deployed: false})}}>
                {mensModal.tittle}
            </ModalHeader>
            <ModalBody>
                <Alert
                        buttonType="default"
                        size="medium"                    
                        onClose={() => setAlertDial(false)}
                        text={mensModal.body}
                        //text="No se cumplen los criterios!"
                        type={mensModal.type}
                        //type="warning"
                        withIcon
                ></Alert>                
            </ModalBody>
            <ModalFooter>              
            </ModalFooter>
            </Modal>
        </div>
    );
}

export default dialogsSrcSIEC