// Set your publishable key: remember to change this to your live publishable key in production
$(document).ready(function(){

  // Create a Stripe client
  var stripe = Stripe('pk_test_51NJvzEJ3qhyqI7JFjuCX1kMPm70bFW75EUWA5h4OxOAt14TqQ4D6fuSS1kEZizQeSu4gsEtLuIulV0Hup8JyQRAj00AqHXGk37');

  // Create an instance of Elements
  var elements = stripe.elements();

  // Try to match bootstrap 4 styling
  var style = {
      base: {
          'lineHeight': '1.35',
          'fontSize': '1.11rem',
          'color': '#495057',
          'fontFamily': 'apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif'
      }
  };

  // Card number
  var card = elements.create('cardNumber', {
      'placeholder': '',
      'style': style
  });
  card.mount('#card-number');

  // CVC
  var cvc = elements.create('cardCvc', {
      'placeholder': '',
      'style': style
  });
  cvc.mount('#card-cvc');

  // Card expiry
  var exp = elements.create('cardExpiry', {
      'placeholder': '',
      'style': style
  });
  exp.mount('#card-exp');

    // Handle form submission
    var form = document.getElementById('payment-form');

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        stripe.createToken(card).then(function (result) {
            if (result.error) {
                // Display error message to the user
                var errorElement = document.getElementById('card-errors');
                errorElement.textContent = result.error.message;
            } else {
                // Send the token to your server for processing
                fetch('/charge', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token: result.token.id }),
                })
                    .then(function (response) {
                        return response.json();
                    })
                    .then(function (data) {
                        if (data.success) {
                            // Payment succeeded, you can redirect or show a success message
                            alert('Payment succeeded!');
                        } else {
                            // Payment failed, display an error message
                            alert('Payment failed: ' + data.error);
                        }
                    });
            }
        });
    });

});

function initPayPalButton() {
    paypal.Buttons({
        style: {
            shape: 'rect',
            color: 'gold',
            layout: 'horizontal',
            label: 'paypal',
        },

        createOrder: function(data, actions) {
            return actions.order.create({
              
                purchase_units: [{"amount":{"currency_code": "USD", "value": total}}]
            });
        },

        onApprove: function(data, actions) {
          return actions.order.capture().then(function(orderData) {
              // Log order details
              console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));
      
              // Send order data to server for MySQL storage
              const orderDetails = {
                  products: cartData, // Your array of cart items
                  total: total, // Total order amount
                  firstName: orderData.payer.name.given_name,
                  lastName: orderData.payer.name.surname,
                  orderDate: new Date().toISOString() // Current date and time
              };
      console.log(orderDetails)
              // Send the order details to your server using a fetch or AJAX request
              fetch('/store-order', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(orderDetails)
              }).then(response => {
                  // Handle the response if needed
              }).catch(error => {
                  console.error('Error storing order:', error);
              });
      
              // Show a success message within this page, for example:
              // const element = document.getElementById('paypal-button-container');
              // element.innerHTML = '';
              // element.innerHTML = '<h3>Thank you for your payment!</h3>';
              // const checkoutButton = document.getElementById("checkout-button")
              // checkoutButton.remove()
              localStorage.clear()
              actions.redirect('https://hekto-yb2r.onrender.com/success');
                     });
      },
      

        onError: function(err) {
            console.log(err);
        }
    }).render('#paypal-button-container');
}
initPayPalButton();
