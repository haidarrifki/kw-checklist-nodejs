const error = (status, message) => {
  if ( ! message) {
    switch (status) {
      case 401:
        message = 'Not Authorized'
        break;
      case 404:
        message = 'Not Found'
        break;
      case 422:
        message = 'Required parameter not provided'
        break;
      case 500:
        message = 'Server Error'
        break;
      default:
        message = null;
        break;
    }
  }

  return {
    status: status,
    error: message
  }
}

const success = (data) => {
  return {
    data: data
  }
}

module.exports = { error, success };