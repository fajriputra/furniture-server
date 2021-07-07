module.exports = {
  getToken: async (req) => {
    let token = req.headers.authorization
      ? req.headers.authorization.replace("Bearer ", "")
      : null;

    return token && token.length ? token : null;
  },
};
