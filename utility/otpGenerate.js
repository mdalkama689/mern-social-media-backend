const generateOTP = () => {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return randomDigits.toString();
};

export default generateOTP;
