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
  }
}

const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

darkModeMediaQuery.addEventListener("change", (event) => {
  if (event.matches) {
  } else {
  }
});
// Check if payment was approved
const paymentApproved = localStorage.getItem("paymentApproved");
if (paymentApproved === "true") {
  // Display the success animation
  document.querySelector(".yas5").classList.add("yas5_display");

  // Remove the "approved" status from local storage after 5 seconds
  setTimeout(function () {
    document.querySelector(".yas5").classList.remove("yas5_display");
    localStorage.removeItem("paymentApproved");
  }, 2200); // Adjust the timeout as needed
}

