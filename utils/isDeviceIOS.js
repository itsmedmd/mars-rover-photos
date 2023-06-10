const isDeviceIOS = () => {
  const userAgent = navigator.userAgent;
  const chromeAgent = userAgent.indexOf("Chrome") > -1;
  let safariAgent = userAgent.indexOf("Safari") > -1;

  // Discard Safari since it also matches Chrome
  if (chromeAgent && safariAgent) {
    safariAgent = false;
  }

  const isIOS =
    (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) || safariAgent;

  return isIOS;
};

export default isDeviceIOS;
