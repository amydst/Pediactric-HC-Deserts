document.getElementById('toggleButton').addEventListener('click', function() {  // selects HTML element with ID toggleButton. Adding to it event listener. When clicked the following code is running:
    let letterText = document.getElementById('letterText');  //creating letterText and assign to it HTML element 'letterText'
   //  Deciding if element is visible on the page:
    if (letterText.style.display === 'none' || letterText.style.display === '') { // This checks if the element is hidden (display: none).
        letterText.style.display = 'block'; // If the element is hidden, it change display to block, so element become visible.
        setTimeout(function() {
            letterText.style.opacity = 1;
        }, 10);   // After 10 milliseconds, changes the element's opacity to 1 (making it fully visible).
    } else {
        letterText.style.opacity = 0; // If the element is already visible, changes its opacity to 0 (making it invisible).
        setTimeout(function() {
            letterText.style.display = 'none'; // // After 300 milliseconds, hides the element (sets 'display: none')
        }, 300);
    }
});