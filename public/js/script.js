const link = document.createElement("link");
document.head.appendChild(link);
link.rel = "icon";
if (
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
) {
  link.href = "images/whiteLogo.png";
} else {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches
  ) {
    link.href = "images/blackLogo.png";
  } else {
    link.href = "images/otherLogo.jpeg";
    console.log("other");
  }
}

const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

darkModeMediaQuery.addEventListener("change", (event) => {
  if (event.matches) {
    console.log("Dark Mode");
  } else {
    console.log("Other theme");
  }
});
