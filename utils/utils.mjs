const getUserFromSession = (req) => {
    return req.session.userId ? { id: req.session.userId, name: req.session.userName } : null;
};

export { getUserFromSession };
