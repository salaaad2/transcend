import { Request } from 'express';

interface RequestApi42 extends Request {
    client_id: string,
    redirect_uri: string,
    state: string,
    response_type: string,
}

export default RequestApi42;
