import sinon from 'sinon';
import GidClient from '..';

export function stubGidClient(clientId = 'default-client-id', clientSecret = 'default-client-secret'): GidClientStub {
  return {
    clientId,
    clientSecret,
    downloadFile: sinon.stub(GidClient.prototype, 'downloadFile'),
    getAccessToken: sinon.stub(GidClient.prototype, 'getAccessToken'),
    reportError: sinon.stub(GidClient.prototype, 'reportError'),
    sendOffer: sinon.stub(GidClient.prototype, 'sendOffer'),
    uploadFile: sinon.stub(GidClient.prototype, 'uploadFile'),
    validateRequest: sinon.stub(GidClient.prototype, 'validateRequest')
  };
}

export type GidClientStub = {
  [P in keyof GidClient]: GidClient[P] extends AnyFunction ? SinonMethodStub<GidClient[P]> : GidClient[P];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

type SinonMethodStub<T extends AnyFunction> = sinon.SinonStub<Parameters<T>, ReturnType<T>>;

export default stubGidClient;
