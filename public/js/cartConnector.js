const cartInner = document.querySelector(".modal-body")
let cartData = localStorage.getItem("cart");
const cartArray = JSON.parse(cartData);

cartInner.innerHTML = `` 
// Your cartContent
const productTitle = cartArray[0].productTitle;
const productAmount = cartArray[0].productAmount;

// Create two <p> elements
const divParagraph = document.createElement('div')
const titleParagraph = document.createElement('p');
const amountParagraph = document.createElement('p');

// Set the text content of the <p> elements
titleParagraph.textContent = productTitle;
amountParagraph.textContent = productAmount;
divParagraph.appendChild(titleParagraph)
divParagraph.appendChild(amountParagraph)
divParagraph.classList.add('cart_product')


// Append the <p> elements to the cartInner element
cartInner.appendChild(divParagraph);