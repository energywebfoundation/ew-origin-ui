import * as React from 'react';
import { Modal, Button } from 'react-bootstrap';
import './Modal.scss';
import '../PageButton/PageButton.scss';

import { Configuration } from 'ew-utils-general-lib';
import { Certificate } from 'ew-origin-lib';

import { showNotification, NotificationType } from '../../utils/notifications';

interface IBuyCertificateBulkModalProps {
    conf: Configuration.Entity;
    certificates: Certificate.Entity[];
    showModal: boolean;
    callback: () => void;
}

interface IBuyCertificateBulkModalState {
    show: boolean;
}

export class BuyCertificateBulkModal extends React.Component<IBuyCertificateBulkModalProps, IBuyCertificateBulkModalState> {
    constructor(props, context) {
        super(props, context);

        this.handleClose = this.handleClose.bind(this);
        this.buyCertificateBulk = this.buyCertificateBulk.bind(this);

        this.state = {
            show: props.showModal
        };
    }

    componentWillReceiveProps(newProps: IBuyCertificateBulkModalProps) {
        this.setState({
            show: newProps.showModal
        });
    }

    async buyCertificateBulk() {
        const certificateIds: string[] = this.props.certificates.map(cert => cert.id);
        await this.props.conf.blockchainProperties.certificateLogicInstance.buyCertificateBulk(certificateIds);

        showNotification(`Certificates have been bought.`, NotificationType.Success);
        this.handleClose();
    }

    handleClose() {
        this.props.callback();
        this.setState({ show: false });
    }

    render() {
        const totalWh = this.props.certificates.reduce((a, b) => a + Number(b.powerInW), 0);

        return (
            <Modal show={this.state.show} onHide={this.handleClose} animation={false} backdrop={true} backdropClassName="modal-backdrop">
                <Modal.Header>
                    <Modal.Title>Buy certificates</Modal.Title>
                </Modal.Header>
                <Modal.Body className="container">
                    <div className="row">
                        <div className="col">
                            <p>{`You selected a total of ${totalWh / 1e6} MWh worth of I-REC certificates.`}</p>
                            <p>Would you like to proceed with buying them?</p>
                        </div>
                    </div>

                    <hr />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={this.handleClose} className="modal-button modal-button-cancel">Cancel</Button>
                    <Button variant="primary" onClick={this.buyCertificateBulk} className="modal-button modal-button-publish">
                        Buy
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
  }
