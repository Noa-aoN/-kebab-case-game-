const ANALYTICS_MEASUREMENT_ID = "G-M4H2XHF2LC";

window.dataLayer = window.dataLayer || [];

function gtag() {
  dataLayer.push(arguments);
}

function loadAnalyticsScript() {
  const script = document.createElement("script");

  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_MEASUREMENT_ID}`;
  document.head.append(script);
}

loadAnalyticsScript();
gtag('js', new Date());
gtag('config', ANALYTICS_MEASUREMENT_ID);
