var moreBtns = document.querySelectorAll('#moreBtn');

// event listener for the more infor buttons
moreBtns.forEach(function (button, index) {
  button.addEventListener('click', function (event) {
    event.preventDefault();
    // set the style of last child of list that the more button is on to block
    event.target.parentNode.parentNode.lastElementChild.classList.toggle('show');
    event.target.classList.toggle('fa-angle-double-down');
    event.target.classList.toggle('fa-angle-double-up');
  });
});

var languageBtn = document.querySelector('#languageBtn');

languageBtn.addEventListener('change', function (event) {
  this.submit();
});
