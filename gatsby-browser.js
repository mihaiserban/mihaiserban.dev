/* eslint-disable */

import "./src/styles/global.css";
import "./src/styles/layout.css";

export const onServiceWorkerUpdateReady = () => {
  const answer = window.confirm(
    `mihaiserban.dev has been updated. ` + `Reload to display the latest version?`
  );

  if (answer === true) {
    window.location.reload();
  }
};
