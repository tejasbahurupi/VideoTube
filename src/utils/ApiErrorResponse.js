class ApiErrorResponse extends Error {
  //extends the inbuilt for errors class (as errors is a class)
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stackTrace
  ) {
    //stackTrace is optional
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.errors = errors;
    if (stackTrace) this.stackTrace = stackTrace;
    else {
      Error.captureStackTrace(this, this.constructor); //should be Error not errors
    }
  }
}
export { ApiErrorResponse };
