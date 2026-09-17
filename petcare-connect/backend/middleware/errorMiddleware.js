const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  let status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Something went wrong";

  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  }
  if (err.code === 11000) {
    status = 400;
    message = "That record already exists";
  }
  if (err.name === "CastError") {
    status = 400;
    message = "Invalid id format";
  }

  res.status(status).json({ message });
};

module.exports = { notFound, errorHandler };
