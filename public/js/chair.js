const decreaseAmount = document.getElementById("productMinus");
const increaseAmount = document.getElementById("productPlus");
const productAmount = document.getElementById("productAmount");
const productTitle = document.querySelector(".product_title").innerHTML;
const addToCart = document.querySelector(".product_add");
const cartInner = document.querySelector(".modal-body");
window.onload = productAmount.innerHTML = `1`
let cartData = localStorage.getItem("cart");

if (cartData) {
  cartData = JSON.parse(cartData);
} else {
  cartData = [];
}
const existingItemIndex2 = cartData.findIndex(item => item.productTitle === productTitle);
if (existingItemIndex2 !== -1) {
addToCart.innerHTML = `Added`
addToCart.disabled = true
}
function updateCartData() {

  const existingItemIndex = cartData.findIndex(item => item.productTitle === productTitle);

  if (existingItemIndex !== -1) {
    // If the product is already in the cart, remove it before updating
    cartData.splice(existingItemIndex, 1);
  }

  // Add the updated product to the cart
  cartData.push({
    productTitle: productTitle,
    productAmount: parseInt(productAmount.innerHTML),
  });
addToCart.innerHTML = `Added`
addToCart.disabled = true
  // Save the updated cartData back to localStorage
  localStorage.setItem("cart", JSON.stringify(cartData));
  location.reload()
}

// Initialize productAmount from localStorage
const existingItemIndex = cartData.findIndex(item => item.productTitle === productTitle);
if (existingItemIndex !== -1) {
  productAmount.innerHTML = cartData[existingItemIndex].productAmount;
}

decreaseAmount.addEventListener("click", function () {
  if (productAmount.innerHTML > 1) {
    productAmount.innerHTML--;
    updateCartData();
  }
});

increaseAmount.addEventListener("click", function () {
  productAmount.innerHTML++;
  updateCartData();
});

addToCart.addEventListener("click", function () {
  updateCartData();
  // You can also update the UI here to indicate that the product was added to the cart
  addToCart.innerHTML = `Added`;
  addToCart.disabled = true;
});


// Display cart contents
if (cartData.length > 0) {
  cartData.forEach(item => {
    const divParagraph = document.createElement('div');
    const titleParagraph = document.createElement('p');
    const amountParagraph = document.createElement('p');

    titleParagraph.textContent = item.productTitle;
    amountParagraph.textContent = item.productAmount;

    divParagraph.appendChild(titleParagraph);
    divParagraph.appendChild(amountParagraph);
    divParagraph.classList.add('cart_product');

    cartInner.appendChild(divParagraph);
  });
}
