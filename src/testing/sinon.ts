import { stub, SinonStub } from 'sinon';
import GidClient from '..';

export function stubGidClient(clientId = 'default-client-id', clientSecret = 'default-client-secret'): GidClientStub {
  return {
    clientId,
    clientSecret,
    downloadFile: stub(GidClient.prototype, 'downloadFile'),
    getAccessToken: stub(GidClient.prototype, 'getAccessToken'),
    reportError: stub(GidClient.prototype, 'reportError'),
    sendOffer: stub(GidClient.prototype, 'sendOffer'),
    uploadFile: stub(GidClient.prototype, 'uploadFile'),
    validateRequest: stub(GidClient.prototype, 'validateRequest')
  };
}

export type GidClientStub = {
  [P in keyof GidClient]: GidClient[P] extends AnyFunction ? SinonMethodStub<GidClient[P]> : GidClient[P];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

type SinonMethodStub<T extends AnyFunction> = SinonStub<Parameters<T>, ReturnType<T>>;

export default stubGidClient;
