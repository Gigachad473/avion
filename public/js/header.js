const header = document.querySelectorAll('header')
header.forEach((header) => {
    header.innerHTML = `
    <a href="/">Avion</a
    ><div><svg onclick="window.location.href='/register'" class="user_icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg><button type="button" data-bs-toggle="modal" data-bs-target="#exampleModal"><svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      class="header_svg"
    >
      <rect
        width="16"
        height="16"
        fill="white"
        style="mix-blend-mode: multiply"
      />
      <path
        d="M5 15C5.55228 15 6 14.5523 6 14C6 13.4477 5.55228 13 5 13C4.44772 13 4 13.4477 4 14C4 14.5523 4.44772 15 5 15Z"
        fill="#2A254B"
      />
      <path
        d="M12 15C12.5523 15 13 14.5523 13 14C13 13.4477 12.5523 13 12 13C11.4477 13 11 13.4477 11 14C11 14.5523 11.4477 15 12 15Z"
        fill="#2A254B"
      />
      <path
        d="M14 3.50001H2.91L2.5 1.40001C2.47662 1.28537 2.41379 1.18256 2.32243 1.10947C2.23107 1.03639 2.11697 0.997651 2 1.00001H0V2.00001H1.59L3.5 11.6C3.52338 11.7146 3.58621 11.8175 3.67757 11.8905C3.76893 11.9636 3.88303 12.0024 4 12H13V11H4.41L4 9.00001H13C13.1156 9.00284 13.2286 8.96552 13.3197 8.89441C13.4109 8.8233 13.4746 8.7228 13.5 8.61001L14.5 4.11001C14.5168 4.03582 14.5164 3.95879 14.4989 3.88478C14.4814 3.81076 14.4472 3.74172 14.399 3.6829C14.3508 3.62407 14.2898 3.57703 14.2206 3.54534C14.1515 3.51364 14.076 3.49814 14 3.50001ZM12.6 8.00001H3.81L3.11 4.50001H13.375L12.6 8.00001Z"
        fill="#2A254B"
      />
    </svg></button><!-- Modal -->
    <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fs-5" id="exampleModalLabel">Your Cart</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>There is nothing in your cart<p>
          </div>
          <div class="modal-footer">
          <button onclick="window.location.href='/checkout'" style="color:black">Checkout</button>
          </div>
          </div>
        </div>
      </div>
    </div>
`
})

fetch('/check-profile', {
  method: 'POST',
  headers: {
      'Content-Type': 'application/json'
  },
}).then(response => {
  if(response.status === 200) {
  // Handle the response if needed
  document.querySelector(".user_icon").setAttribute("onclick", "window.location.href='/profile'")
  }

}).catch(error => {
  console.error('Error storing order:', error);
});