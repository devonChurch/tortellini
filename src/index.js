// Add branch:

(() => {
  const BUILD_NAME = process.env.BUILD_NAME;
  const element = document.createElement("h1");

  element.textContent = `Build name: ${BUILD_NAME}`;
  document.body.appendChild(element);
})();

// Add environment:

(async () => {
  const { environment } = await fetch("../env.config.json").then((response) => response.json());
  const element = document.createElement("h2");

  element.textContent = `Environment: ${environment}`;
  document.body.appendChild(element);
})();
