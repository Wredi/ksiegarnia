const getUserFromSession = (req) => {
    return req.session.userId ? { id: req.session.userId, name: req.session.userName } : null;
};

const isInt = (value) => {
  return !isNaN(value) && 
         parseInt(Number(value)) == value && 
         !isNaN(parseInt(value, 10));
}

export { getUserFromSession, isInt };
