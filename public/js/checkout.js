let cartData = localStorage.getItem("cart");
if (cartData) {
  cartData = JSON.parse(cartData);
} else {
  cartData = [];
}

// Get the "products" div to which we will append the product data
const productsDiv = document.getElementById("products");

// Check if there is data in the cart
if (cartData && Array.isArray(cartData)) {
  // Loop through each item in the cart and create product elements
  cartData.forEach((item) => {
    const productDiv = document.createElement("div");
    productDiv.classList.add("checkout_product_block");

    productDiv.innerHTML = `
                    <div class="checkout_product_product">
                        <img src="${
                          item.productImage
                        }" alt="" class="product_image" />
                        <div class="product_text_description">
                            <h5 class="product_title">${item.productTitle}</h5>
                            <p class="product_description">${
                              item.productDescription
                            }</p>
                            <p class="product_price">${item.productPrice}</p>
                        </div>
                    </div>
                    <div class="checkout_product_quantity">
                        <button class="product_minus">-</button>
                        <p class="product_quantity">${item.productAmount}</p>
                        <button class="product_plus">+</button>
                    </div>
                    <div class="checkout_product_total">
                        <p class="product_total">£${
                          parseFloat(item.productPrice.replace("£", "")) *
                          item.productAmount
                        }</p>
                    </div>
                `;

    // Append the product element to the "products" div
    productsDiv.appendChild(productDiv);
  });
}

const productAmountInner = document.querySelectorAll(".product_quantity");
const minusButtons = document.querySelectorAll(".product_minus");
const plusButtons = document.querySelectorAll(".product_plus");
const productTotal = document.querySelectorAll(".product_total");
minusButtons.forEach((minus, index) => {
  minus.addEventListener("click", function () {
    const currentAmount = parseInt(productAmountInner[index].innerHTML);
    const currentTotal = Number(productTotal[index].innerHTML.replace("£", ""));
    if (currentAmount > 1) {
      const currentAmount = parseInt(productAmountInner[index].innerHTML);
      const newTotal = (currentTotal / currentAmount) * (currentAmount - 1);
      productTotal[index].innerHTML = `£${newTotal}`;

      productAmountInner[index].innerHTML = currentAmount - 1;
      updateCartInner(index, currentAmount - 1);
    }
    updateSum();
    const updatedSum = updateSum();
    updatePayPalButton(updatedSum); // Call a function to update the PayPal button
  });
});

plusButtons.forEach((plus, index) => {
  plus.addEventListener("click", function () {
    const currentTotal = Number(productTotal[index].innerHTML.replace("£", ""));

    const currentAmount = parseInt(productAmountInner[index].innerHTML);
    const newTotal = (currentTotal / currentAmount) * (currentAmount + 1);
    productTotal[index].innerHTML = `£${newTotal}`;
    productAmountInner[index].innerHTML = currentAmount + 1;
    updateCartInner(index, currentAmount + 1);
    updateSum();
    const updatedSum = updateSum();
    updatePayPalButton(updatedSum); // Call a function to update the PayPal button
  });
});
function updatePayPalButton(updatedSum) {
  // Remove the existing PayPal button instance
  document.querySelector("#paypal-button-container").innerHTML = "";

  // Initialize a new PayPal button with the updated sum
  initPayPalButton(updatedSum);
}

function updateCartInner(index, newAmount) {
  // Update the cartData with the new amount for the corresponding product.
  const productTitle = cartData[index].productTitle;
  const productPrice = cartData[index].productPrice;

  cartData[index].productAmount = newAmount;

  // Update the cartData in localStorage.
  localStorage.setItem("cart", JSON.stringify(cartData));
}

// Assuming you have HTML elements with a class "truncate-me"
const elementsToTruncate = document.querySelectorAll(".product_description");
const maxLength = 50; // Set your desired maximum length

elementsToTruncate.forEach(function (element) {
  const originalText = element.textContent;

  if (originalText.length > maxLength) {
    const truncatedText = originalText.substring(0, maxLength) + "...";
    element.textContent = truncatedText;
  }
});
function updateSum() {
  const allNums = document.querySelectorAll(".product_total");
  let sum = 0; // Initialize sum to zero

  allNums.forEach((numElement) => {
    const num = parseFloat(numElement.textContent.replace("£", "")); // Parse the number
    sum += num; // Add the parsed number to the sum
  });

  // Display the sum with the pound symbol
  document.querySelector(".total").innerHTML = `£${sum.toFixed(2)}`;
  return sum;
}

console.log(updateSum());

$(document).ready(function () {
  var stripe = Stripe(
    "pk_test_51NJvzEJ3qhyqI7JFjuCX1kMPm70bFW75EUWA5h4OxOAt14TqQ4D6fuSS1kEZizQeSu4gsEtLuIulV0Hup8JyQRAj00AqHXGk37"
  );

  var elements = stripe.elements();

  var style = {
    base: {
      lineHeight: "1.35",
      fontSize: "1.11rem",
      color: "#495057",
      fontFamily:
        'apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
    },
  };

  // Card number
  var card = elements.create("cardNumber", {
    placeholder: "4242 4242 4242 4242",
    style: style,
  });
  card.mount("#card-number");

  // CVC
  var cvc = elements.create("cardCvc", {
    placeholder: "123",
    style: style,
  });
  cvc.mount("#card-cvc");

  // Card expiry
  var exp = elements.create("cardExpiry", {
    placeholder: "01/12",
    style: style,
  });
  exp.mount("#card-exp");

  // Handle form submission
  var form = document.getElementById("payment-form");

  let updatedSum; // Declare a variable to store the updated sum

  // ...
  
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    stripe.createToken(card).then(function (result) {
      if (result.error) {
        // Display error message to the user
        var errorElement = document.getElementById("card-errors");
        errorElement.textContent = result.error.message;
      } else {
        // Calculate and store the updated sum
        updatedSum = updateSum(); // Calculate the sum here
  
        // Send the token and the payment amount to your server for processing
        fetch("/charge", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: result.token.id, amount: updatedSum }), // Include the payment amount
        })
          .then(function (response) {
            return response.json();
          })
          .then(function (data) {
            if (data.success) {
              // Payment succeeded, you can redirect or show a success message
              localStorage.clear();
              document.querySelector(".yas5").classList.add("yas5_display");
              setTimeout(function () {
                document.querySelector(".yas5").classList.remove("yas5_display");
                window.location = "/"
              }, 2200);
            } else {
              // Payment failed, display an error message
              alert("Payment failed: " + data.error);
            }
          });
      }
    });
  });
  
  
});
initPayPalButton(updateSum());

function initPayPalButton(sum) {
  paypal
    .Buttons({
      style: {
        shape: "rect",
        color: "gold",
        layout: "horizontal",
        label: "paypal",
      },

      createOrder: function (data, actions) {
        return actions.order.create({
          purchase_units: [{ amount: { currency_code: "USD", value: sum } }],
        });
      },

      onApprove: function (data, actions) {
        return actions.order.capture().then(function (orderData) {
          // Handle the approval as needed
          localStorage.clear();
          localStorage.setItem("paymentApproved", "true"); // Store approval status
          window.location = "/"; // Redirect to homepage
        });
      },

      onError: function (err) {
        console.log(err);
      },
    })
    .render("#paypal-button-container");
}
