var moreBtns = document.querySelectorAll('#moreBtn');

// event listener for the more infor buttons
moreBtns.forEach(function (button, index) {
  button.addEventListener('click', function (event) {
    event.preventDefault();
    // set the style of last child of list that the more button is on to block
    event.target.parentNode.lastElementChild.classList.toggle('show');
    if (event.target.innerHTML === 'More info') {
      event.target.innerHTML = 'Less info';
    } else {
      event.target.innerHTML = 'More info';
    }
  });
});
