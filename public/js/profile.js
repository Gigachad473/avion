const orderDates = document.querySelectorAll("time");
orderDates.forEach((date) => {
  // Input date string
  const inputDateString = `${date.innerHTML}`;

  // Create a Date object from the input string
  const dateObject = new Date(inputDateString);

  // Extract date components
  const day = dateObject.getDate();
  const month = dateObject.getMonth() + 1; // Months are zero-based, so add 1
  const year = dateObject.getFullYear();
  const hours = dateObject.getHours();
  const minutes = dateObject.getMinutes();
  const seconds = dateObject.getSeconds();

  // Create the desired format string
  const formattedDateString = `${day.toString().padStart(2, "0")}.${month
    .toString()
    .padStart(2, "0")}.${year} ${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  date.innerHTML = `${formattedDateString}`;
});
const couponDates = document.querySelectorAll(".coupon_time");
couponDates.forEach((date) => {
  // Input date string
  const inputDateString = `${date.innerHTML}`;

  // Create a Date object from the input string
  const dateObject = new Date(inputDateString);

  // Extract date components
  const day = dateObject.getDate();
  const month = dateObject.getMonth() + 1; // Months are zero-based, so add 1
  const year = dateObject.getFullYear();

  // Create the desired format string
  const formattedDateString = `${day.toString().padStart(2, "0")}.${month
    .toString()
    .padStart(2, "0")}.${year} `;

  date.innerHTML = `${formattedDateString}`;
});

const tabs = document.querySelectorAll("[data-tab-target]");
const tabContents = document.querySelectorAll("[data-tab-content]");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = document.querySelector(tab.dataset.tabTarget);
    tabContents.forEach((tabContent) => {
      tabContent.classList.remove("active");
    });
    tabs.forEach((tab) => {
      tab.classList.remove("active");
    });
    tab.classList.add("active");
    target.classList.add("active");
  });
});
let copybtn = document.querySelector(".copybtn");

function copyIt() {
  let copyInput = document.querySelector("#copyvalue");

  copyInput.select();

  document.execCommand("copy");

  copybtn.textContent = "COPIED";
}
if (document.querySelector(".card") === null) {
  document.querySelector(".container").innerHTML = "You dont have any coupons";
} else {
  console.log(false);
}
fetch("/profile")
  .then((response) => {
console.log(response)  })
  .catch((error) => {
    console.error("Error storing order:", error);
  });
