const decreaseAmount = document.getElementById("productMinus");
const increaseAmount = document.getElementById("productPlus");
const productAmount = document.getElementById("productAmount");
const productTitle = document.querySelector(".product_title").innerHTML;
console.log(productTitle);
const productImage = document.querySelector(".product_image").src;
const productDescription = document.querySelector(".product_desc").innerHTML;

const addToCart = document.querySelector(".product_add");
const cartInner = document.querySelector(".modal-body");
const productPrice = document.querySelector(".product_price").innerHTML;
window.onload = productAmount.innerHTML = `1`;
let cartData = localStorage.getItem("cart");
if (cartData) {
  cartData = JSON.parse(cartData);
} else {
  cartData = [];
}

cartInner.innerHTML = ``;

function updateCart() { 
  // Clear the cartInner
  if (cartData !== null && cartData.length > 0) {
    // Code to execute if cartData is not null and not an empty array
    cartInner.innerHTML = ``;
  } else {
    cartInner.innerHTML = `Your cart is empty`;
  }

  // Update the localStorage with the modified cartData
  localStorage.setItem("cart", JSON.stringify(cartData));

  // Loop through each item in cartData
  cartData.forEach((cartItem, index) => {
    const productTitle = cartItem.productTitle;
    const productAmount = cartItem.productAmount;

    // Create a div to hold the item information
    const divParagraph = document.createElement("div");
    divParagraph.classList.add("cart_product");

    // Create <p> elements for the title and amount
    const titleParagraph = document.createElement("p");
    titleParagraph.classList.add("titleParagr");
    const amountParagraph = document.createElement("p");
    amountParagraph.classList.add("amountParagr");
    const deleteButton = document.createElement("button");
    const minusButton = document.createElement("button");
    const plusButton = document.createElement("button");
    const amountBox = document.createElement("div");
    minusButton.textContent = "-";
    plusButton.textContent = "+";
    minusButton.classList.add("cartDecrease");
    plusButton.classList.add("cartIncrease");
    deleteButton.classList.add("delete");
    deleteButton.textContent = `x`;
    amountBox.appendChild(minusButton);
    amountBox.appendChild(amountParagraph);
    amountBox.appendChild(plusButton);
    amountBox.classList.add("amountBox");

    // Set the text content of the <p> elements
    titleParagraph.textContent = productTitle;
    amountParagraph.textContent = productAmount;

    // Add a click event listener to the delete button
    deleteButton.addEventListener("click", () => {
      // Remove the item from cartData
      cartData.splice(index, 1);

      // Update the cart on the webpage and localStorage
      updateCart();
      // location.reload()
    });

    // Append the <p> elements to the div
    divParagraph.appendChild(titleParagraph);
    divParagraph.appendChild(amountBox);
    divParagraph.appendChild(deleteButton);

    // Append the div to the cartInner element
    cartInner.appendChild(divParagraph);
  });
}

// Initial rendering of the cart
updateCart();

const productTitles = document.querySelectorAll("#title");
const productAmounts = document.querySelectorAll("#amount");
const existingItemIndex2 = cartData.findIndex(
  (item) => item.productTitle === productTitle
);
if (existingItemIndex2 !== -1) {
  addToCart.innerHTML = `Added`;
  addToCart.disabled = true;
}
function updateCartData() {
  const existingItemIndex = cartData.findIndex(
    (item) => item.productTitle === productTitle
  );

  if (existingItemIndex !== -1) {
    // If the product is already in the cart, remove it before updating
    cartData.splice(existingItemIndex, 1);
  }
  if (existingItemIndex == -1) {
    location.reload();
  }

  // Add the updated product to the cart
  cartData.push({
    productTitle: productTitle,
    productAmount: parseInt(productAmount.innerHTML),
    productPrice: productPrice,
    productImage: productImage,
    productDescription: productDescription,
  });
  addToCart.innerHTML = `Added`;
  addToCart.disabled = true;

  // Save the updated cartData back to localStorage
  localStorage.setItem("cart", JSON.stringify(cartData));
  productTitles.forEach((title, index) => {
    if (title.innerHTML == `${productTitle}`) {
      // productAmounts.forEach((amount) => {
      //   amount.innerHTML = `${cartData[existingItemIndex].productAmount}`
      // })
      productAmounts[index].textContent =
        cartData[existingItemIndex].productAmount;
    } else {
      console.log(false);
    }
  });
}

// Initialize productAmount from localStorage
const existingItemIndex = cartData.findIndex(
  (item) => item.productTitle === productTitle
);
if (existingItemIndex !== -1) {
  productAmount.innerHTML = cartData[existingItemIndex].productAmount;
}

addToCart.addEventListener("click", function () {
  updateCartData();
  // You can also update the UI here to indicate that the product was added to the cart
  addToCart.innerHTML = `Added`;
  addToCart.disabled = true;
  location.reload();
});
const productAmountInner = document.querySelectorAll(".amountParagr");
const minusButtons = document.querySelectorAll(".cartDecrease");
const plusButtons = document.querySelectorAll(".cartIncrease");

plusButtons.forEach((plus, index) => {
  plus.addEventListener("click", function () {
    const currentAmount = parseInt(productAmountInner[index].innerHTML);
    const newAmount = currentAmount + 1;
    productAmountInner[index].innerHTML = newAmount;
    updateCartInner(index, newAmount); // Update cart modal
    updateAmountInBothPlaces(index, newAmount); // Update product page
  });
});

minusButtons.forEach((minus, index) => {
  minus.addEventListener("click", function () {
    const currentAmount = parseInt(productAmountInner[index].innerHTML);
    if (currentAmount > 1) {
      const newAmount = currentAmount - 1;
      productAmountInner[index].innerHTML = newAmount;
      updateCartInner(index, newAmount); // Update cart modal
      updateAmountInBothPlaces(index, newAmount); // Update product page
    }
  });
});

decreaseAmount.addEventListener("click", function () {
  if (productAmount.innerHTML > 1) {
    productAmount.innerHTML--; // Increment the displayed amount
  
    // Check if the item was found in cartData
    if (existingItemIndex !== -1) {
      // Calculate the new amount based on the displayed amount
      const newAmount = parseInt(productAmount.innerHTML);
      
      // Update the amount in the cart modal and call updateCartInner
      const amountBox = document.querySelectorAll(".amountBox")[existingItemIndex];
      const amountParagraph = amountBox.querySelector(".amountParagr");
      amountParagraph.textContent = newAmount;
      
      // Call the updateCartInner function with the correct index and newAmount
      updateCartInner(existingItemIndex, newAmount);
    } else {
      console.error("Item not found in cartData"); // Handle this case if needed
    }
  }
});
const cartTitle = document.querySelectorAll(".titleParagr");
increaseAmount.addEventListener("click", function () {
  productAmount.innerHTML++; // Increment the displayed amount
  
  // Check if the item was found in cartData
  if (existingItemIndex !== -1) {
    // Calculate the new amount based on the displayed amount
    const newAmount = parseInt(productAmount.innerHTML);
    
    // Update the amount in the cart modal and call updateCartInner
    const amountBox = document.querySelectorAll(".amountBox")[existingItemIndex];
    const amountParagraph = amountBox.querySelector(".amountParagr");
    amountParagraph.textContent = newAmount;
    
    // Call the updateCartInner function with the correct index and newAmount
    updateCartInner(existingItemIndex, newAmount);
  } else {
    console.error("Item not found in cartData"); // Handle this case if needed
  }
});
function updateAmountInBothPlaces(index, newAmount) {
  // Update the cart modal
  const amountBox = document.querySelectorAll(".amountBox")[index];
  const amountParagraph = amountBox.querySelector(".amountParagr");
  amountParagraph.textContent = newAmount;

  // Update the default amount on the product page
  productAmount.innerHTML = newAmount;
}

function updateCartInner(index, newAmount) {
  // Update the cartData with the new amount for the corresponding product.
  const productTitle = cartData[index].productTitle;
  const productPrice = cartData[index].productPrice;

  cartData[index] = {
    productTitle: productTitle,
    productAmount: newAmount,
    productPrice: productPrice,
    productImage: productImage,
    productDescription: productDescription,
  };

  // Update the cartData in localStorage.
  localStorage.setItem("cart", JSON.stringify(cartData));
}

