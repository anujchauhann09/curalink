// standard API response wrapper
class ApiResponse {
  constructor(success, message, data = null) {
    this.success = success;
    this.message = message;
    this.data = data ?? null;
  }

  static ok(res, message = 'Success', data = null) {
    return res.status(200).json(new ApiResponse(true, message, data));
  }

  static created(res, message = 'Created', data = null) {
    return res.status(201).json(new ApiResponse(true, message, data));
  }

  static error(res, statusCode = 500, message = 'Internal server error') {
    return res.status(statusCode).json(new ApiResponse(false, message, null));
  }
}

module.exports = ApiResponse;
