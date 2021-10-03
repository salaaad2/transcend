import * as React from 'react';
import IUserProps from '../interface/IUserProps';
import { Button, Modal } from 'react-bootstrap';

export class OtpBox extends React.Component<IUserProps, any> {

    constructor(props: any) {
        super(props);

        this.state = {
            isShown: false,
        }
    }

    render() {
        if (this.state.isShown === false)
        {
            return (
                <Button className='btn' onClick={(e) => {
                    e.preventDefault();
                    this.setState({ isShown : true});
                }}>Activate 2fa</Button>
            )
        }
        else
        {
            return(
                <Modal
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Modal heading
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h4>Centered Modal</h4>
                        <p>
                            Cras mattis consectetur purus sit amet fermentum. Cras justo odio,
                            dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac
                            consectetur ac, vestibulum at eros.
                        </p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={(e) => {
                            e.preventDefault();
                            this.setState({ isShown : false });
                        }}>Close</Button>
                    </Modal.Footer>
                </Modal>
            )
        }
    }

    public componentDidMount() {}

    public componentDidUpdate() {}
}

export default OtpBox;
