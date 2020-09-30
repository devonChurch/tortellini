const BRANCH_NAME = process.env.BRANCH_NAME;
const headingElement = document.createElement("h1");

headingElement.textContent = `Branch name: ${BRANCH_NAME}`;
document.body.appendChild(headingElement);
