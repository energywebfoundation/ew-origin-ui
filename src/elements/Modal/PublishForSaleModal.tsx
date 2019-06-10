import * as React from 'react';
import { Modal, Button, Dropdown, DropdownButton, MenuItem } from 'react-bootstrap';
import './Modal.scss';
import '../PageButton/PageButton.scss';
import Web3 from 'Web3';

import { Currency } from 'ew-utils-general-lib';
import { Certificate } from 'ew-origin-lib';

import { showNotification, NotificationType } from '../../utils/notifications';

interface IValidation {
    price: boolean;
    erc20TokenAddress: boolean;
}

interface IPublishForSaleModalProps {
    certificate: Certificate.Entity;
    showModal: boolean;
}

interface IPublishForSaleModalState {
    show: boolean;
    price: number;
    currency: string;
    erc20TokenAddress: string;
    validation: IValidation;
}

class PublishForSaleModal extends React.Component<IPublishForSaleModalProps, IPublishForSaleModalState> {
    constructor(props, context) {
        super(props, context);

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.publishForSale = this.publishForSale.bind(this);
        this.validateInputs = this.validateInputs.bind(this);
        this.isFormValid = this.isFormValid.bind(this);

        this.state = {
            show: props.showModal,
            price: 1,
            currency: Currency[0],
            erc20TokenAddress: '',
            validation: {
                price: true,
                erc20TokenAddress: false
            }
        };
    }

    componentWillReceiveProps(newProps: IPublishForSaleModalProps) {
        this.setState({
            show: newProps.showModal
        });
    }

    async publishForSale() {
        const { validation, price, erc20TokenAddress } = this.state;
        const { certificate } = this.props;

        if (this.isFormValid()) {
            if (certificate.forSale) {
                this.handleClose();
                showNotification(`Certificate ${certificate.id} has already been published for sale.`, NotificationType.Error);

                return;
            }

            if (price !== certificate.onChainDirectPurchasePrice) {
                await certificate.setOnChainDirectPurchasePrice(price);
            }

            if (
                erc20TokenAddress !== ''
                && erc20TokenAddress !== ((certificate.acceptedToken as any) as string)
            ) {
                await certificate.setTradableToken(erc20TokenAddress);
            }

            await certificate.publishForSale();
            showNotification(`Certificate ${certificate.id} has been published for sale.`, NotificationType.Success);
            this.handleClose();
        }

    }

    validateInputs(event) {
        switch (event.target.id) {
            case 'priceInput':
                const price = Number(event.target.value);
                const priceValid = !isNaN(price) && price > 0;

                this.setState({
                    price: event.target.value,
                    validation: {
                        price: priceValid,
                        erc20TokenAddress: this.state.validation.erc20TokenAddress
                    }
                });
                break;
            case 'tokenAddressInput':
                this.setState({
                    erc20TokenAddress: event.target.value,
                    validation: {
                        price: this.state.validation.price,
                        erc20TokenAddress: Web3.utils.isAddress(event.target.value)
                    }
                });
        }
    }

    isFormValid() {
        const { validation } = this.state;

        return Object.keys(validation).every(property => validation[property] === true);
    }

    handleClose() {
        this.setState({ show: false });
    }

    handleShow() {
        this.setState({ show: true });
    }

    render() {
        const certificateId = this.props.certificate ? this.props.certificate.id : '';

        const erc20Currency = 'ERC20 Token';
        let currencies = Object.keys(Currency);
        currencies = currencies.splice(Math.ceil(currencies.length / 2), currencies.length - 1);
        currencies.push(erc20Currency);

        return (
            <Modal show={this.state.show} onHide={this.handleClose} animation={false} backdrop={true} backdropClassName="modal-backdrop">
                <Modal.Header>
                    <Modal.Title>Publish certificate #2 for sale</Modal.Title>
                </Modal.Header>
                <Modal.Body className="container">
                    <div className="row price-input">
                        <div className="col vertical-align">Price</div>
                        <div className="col">
                            <input className="modal-input" id="priceInput" type="number" min="1" step="any" placeholder="1" value={this.state.price} onChange={(e) => this.validateInputs(e)} />
                        </div>
                    </div>

                    <div className="row currency-input">
                        <div className="col vertical-align">Currency</div>
                        <div className="col">
                            <DropdownButton
                                id="currencySelectInput"
                                bsStyle="default"
                                title={this.state.currency}
                                onSelect={(eventKey) => this.setState({ currency: eventKey })}
                            >
                                {currencies.map(currency => <MenuItem eventKey={currency}>{currency}</MenuItem>)}
                            </DropdownButton>

                            {this.state.currency === erc20Currency &&
                                <input id="tokenAddressInput" className="modal-input" type="text" placeholder="<ERC20 Token Address>" value={this.state.erc20TokenAddress} onChange={(e) => this.validateInputs(e)} />
                            }
                        </div>
                    </div>

                    <div className="text-danger">
                        {!this.state.validation.price && <div>Price is invalid</div>}
                        {this.state.currency === erc20Currency && !this.state.validation.erc20TokenAddress && <div>Token address is invalid</div>}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={this.handleClose} className="modal-button modal-button-cancel">Cancel</Button>
                    <Button variant="primary" onClick={this.publishForSale} className="modal-button modal-button-publish" disabled={!this.isFormValid()}>
                        Publish for sale
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
  }

export { PublishForSaleModal };
