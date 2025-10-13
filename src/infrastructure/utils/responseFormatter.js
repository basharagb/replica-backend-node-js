export const responseFormatter = {
  success(data, message = 'OK') {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  },

  error(message = 'Something went wrong', status = 500) {
    return {
      success: false,
      message,
      status,
      timestamp: new Date().toISOString()
    };
  }
};