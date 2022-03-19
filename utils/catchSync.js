exports.catchAsync = asyncfunc => {
  return (req, res, next) => {
    asyncfunc(req, res, next).catch(next);
  };
};
