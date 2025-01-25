const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)) //resolve the promise
      .catch((err) => next(err)); //catch the error
  };
};

export default asyncHandler;
