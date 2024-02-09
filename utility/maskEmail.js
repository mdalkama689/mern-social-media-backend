function maskEmail(email) {
    const atIndex = email.indexOf('@');
    if (atIndex >= 0) {
      const visiblePart = email.substring(0, atIndex / 2); // Show the first half
      const maskedPart = '*'.repeat(atIndex - visiblePart.length);
      const domain = email.substring(atIndex);
  
      return `${visiblePart}${maskedPart}${domain}`;
    } else {
      return email; // No '@' symbol found, return the original email
    }
  }
 
  export default maskEmail