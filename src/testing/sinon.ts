import { stub, SinonStub } from 'sinon';
import GidIssuerClient from '..';

export function stubGidIssuerClient(
  clientId = 'default-client-id',
  clientSecret = 'default-client-secret'
): GidIssuerClientStub {
  return {
    clientId,
    clientSecret,
    getAccessToken: stub(GidIssuerClient.prototype, 'getAccessToken'),
    reportError: stub(GidIssuerClient.prototype, 'reportError'),
    sendOffer: stub(GidIssuerClient.prototype, 'sendOffer'),
    sendDirectOffer: stub(GidIssuerClient.prototype, 'sendDirectOffer'),
    uploadFile: stub(GidIssuerClient.prototype, 'uploadFile'),
    validateRequest: stub(GidIssuerClient.prototype, 'validateRequest'),
    setAppUuid: stub(GidIssuerClient.prototype, 'setAppUuid'),
    getAppUuid: stub(GidIssuerClient.prototype, 'getAppUuid')
  };
}

export type GidIssuerClientStub = {
  [P in keyof GidIssuerClient]: GidIssuerClient[P] extends AnyFunction
    ? SinonMethodStub<GidIssuerClient[P]>
    : GidIssuerClient[P];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

type SinonMethodStub<T extends AnyFunction> = SinonStub<Parameters<T>, ReturnType<T>>;

export default stubGidIssuerClient;
