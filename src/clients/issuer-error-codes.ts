export const ERROR_DESCRIPTIONS = {
  '300-1': `Agency cannot determine the type of the document. The image provided does not contain a document`,
  '300-2': `Agency determined that the submitted picture contains a document but does not support this document type.`,
  '300-3': `Document expired, expiration date is in the past relative to the date/time of the verification request`,
  '300-4': `Provided selfie doesn't match the picture on the photo ID`,
  '300-5': `When second page/side is required, only one page/side was provided.`,
  '300-6': `Possibly fraudulent document. Agency could parse and understand document, but cannot issue a successful verification.`,
  '300-7': `Missing required document data: document number. Agency could parse and understand document, but cannot find a document number on it to issue a successful verification.`,
  '300-8': `Document version is not supported and cannot be verified.`,
  '300-9': `Age could not be verified from the submitted document image.`,
  '300-10': `Document images provided are of low quality`,
  '300-11': `Selfie image provided is of low quality`,
  '300-12': `Verification failed: MRZ could not be read`,
  '300-13': `Verification failed: Expiration date could not be read`,
  '300-14': `Verification failed: Your name could not be read`,
  '300-15': `Verification failed: Date of birth could not be read or missing`,
  '300-16': `Verification failed: face could not be detected on the document`,
  '300-17': `Verification failed: face could not be detected on the selfie`,
  '300-18': `Verification failed: document number could not be read`,
  '300-19': `Verification failed: User OVER the allowed age limit`,
  '300-20': `Verification failed: Document doesn't have info about age`,
  '300-21': `User is UNDER the allowable minimum age for this verification.`,
  '300-22': `The name on the ID did not match the name submitted.`,
  '300-23': `The user was banned. (Most commonly due to repeated attempts)`,
  '300-24': `The user uploaded a fake or sample image of an ID.`,
  '300-25': `1st image sent was not of the front page`,
  '300-26': `Verification failed: Gender could not be read`,
  '300-27': `Service reported that customer deceased`,
  '300-28': `Address in identity report can't be confirmed`,
  '300-29': `Date of birth in identity report can't be confirmed`,
  '300-30': `Person in the live photo or live video does not appear to be real (spoofed)`,
  '300-31': `Two mis-matched pages were sent (they do not belong to the same document)`,
  '300-32': `Submitted document is not accepted for this verification request because the user submitted a document which was different from the one allowed by this verification app.`,
  '300-33': `Too many faces detected in the selfie`,
  '300-34': `Direction of face of the user incorrect in the selfie`,
  '300-35': `User declined consent to match selfie image`,
  '300-36': `User entered some data from the document manually`,
  '300-37': `Some text is missing from the front of the document`,
  '300-38': `Some text is missing from the back of the document`,
  '300-39': `Error reading barcode at the back of the document submitted`,
  '300-40': `The user provided selfie image(s )that were unlikely to be genuine.`,

  '400-1': `Required data cannot be verified because information provided by the user did not match the record.`,
  '400-2': `Financial institution does not support verification of required data`,

  '600-1': `Verification failed, some required information could not be verified.`,
  '600-2': `System throws an exception.`,
  '600-3': `User canceled login to the system`,
  '600-4': `User canceled the request for another reason`,
  '600-5': `The user did not complete required steps in time.`,
  '600-6': `No matching account information for the provided user details`,
  '600-7': `GlobaliD system had an error or is not available at the moment`,
  '600-8': `Verification provider system had an error or is not available at the moment`,
  '600-9': `Provided address was not formatted properly`,
  '600-10': `Validation of provided required verification(s) has failed`,
  '600-11': `Only one ongoing instance is possible for this verification; the user cannot resubmit another one.`,
  '600-12': `Verification not possible for given location`,
  '600-13': `Velocity abuse suspected; suspicious repeated requests`,
  '600-14': `Too many retries (resends of OTP or resubmits of information)`,
  '600-15': `Too many tries to submit a verification code`,
  '600-16': `Validation of credential request failed`,

  '700-1': `Required info was not provided for self-declaration`,

  '800-0': `Default error`
};
