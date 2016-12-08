import { isString, isObject, isArray } from 'lodash';
import sprintf from 'sprintf';

const GENERAL_MESSAGE = 'You\'re experiencing unexpected errorInfo, please contact us for support.';

const populateErrorMessage = (errorInfo) => {
  if (!errorInfo) {
    return GENERAL_MESSAGE;
  }

  if (isString(errorInfo.message)) {
    return errorInfo.message || GENERAL_MESSAGE;
  } else if (isObject(errorInfo.message) && !isArray(errorInfo.message)) {
    return errorInfo.message[Object.keys(errorInfo.message)[0]] || GENERAL_MESSAGE;
  }
  return GENERAL_MESSAGE;
};

class GeneralError extends Error {
  constructor(errorInfo) {
    const message = populateErrorMessage(errorInfo);
    super(message);
    this.name = 'GeneralError';
    this.message = sprintf(message, errorInfo.params);
    this.errorInfo = errorInfo;
  }
}

class ErrorBuilder {
  message(theMessage) {
    this.theMessage = theMessage;
    return this;
  }

  fields(theMessage) {
    this.message(theMessage);
    return this;
  }

  field(theField, theMessage) {
    if (!this.theMessage || isString(this.theMessage)) {
      this.theMessage = {};
    }
    this.theMessage[theField] = theMessage;
    return this;
  }

  params(theParams) {
    this.theParams = theParams;
    return this;
  }

  param(key, value) {
    if (!this.theParams) {
      this.theParams = {};
    }
    this.theParams[key] = value;
    return this;
  }

  status(theStatus) {
    this.theStatus = theStatus;
    return this;
  }

  boom() {
    throw new GeneralError({
      message: this.theMessage,
      params: this.theParams,
      status: this.theStatus,
    });
  }
}

GeneralError.builder = () => (new ErrorBuilder());
GeneralError.message = message => GeneralError.builder().message(message);
GeneralError.field = (field, message) => GeneralError.builder().field(field, message);
GeneralError.fields = message => GeneralError.message(message);
GeneralError.status = (status, message, params) => {
  const builder = GeneralError.builder().status(status);
  if (message) {
    builder.message(message);
  }
  if (params) {
    builder.params(params);
  }
  return builder;
};

const statusFactory = status => (
  (message, params) => GeneralError.status(status, message, params)
);
GeneralError.badRequest = statusFactory(400);
GeneralError.unauthorized = statusFactory(401);
GeneralError.notFound = statusFactory(404);
GeneralError.serverError = statusFactory(500);

export default GeneralError;
