class AppError extends Error{
    constructor(message,statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.state = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOpertionalError = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
module.exports = AppError;