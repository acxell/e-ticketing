const apiResponse = (req, res, next) => {
  // Success response wrapper
  res.success = (data, message = 'Success', status = 200) => {
    return res.status(status).json({
      success: true,
      message,
      data
    });
  };

  // Error response wrapper
  res.error = (message, status = 400, errors = null) => {
    return res.status(status).json({
      success: false,
      message,
      errors
    });
  };

  // Pagination response wrapper
  res.paginate = (data, page, limit, total) => {
    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  };

  next();
};

module.exports = apiResponse;