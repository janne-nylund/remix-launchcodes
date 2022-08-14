export const validateUsername = (username) => {
  if (typeof username !== 'string' || username.length < 3) {
    return 'Username must be at least 3 characters'
  }
}

export const validatePassword = (password) => {
  if (typeof password !== 'string' || password.length < 6) {
    return 'Password must be at least 6 characters'
  }
}

export const validateEmail = (email) => {
  var validRegex =
  /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

  if (!email.length || !validRegex.test(email)) {
    return `Please enter a valid email address`;
  }
};

