
// detect search button click
document.querySelector("#search-button").addEventListener('click',
    function animate_button(event) {
        // get the search button
        const button = event.target;
        // create a span element and add it to our button
        const circle = document.createElement("span");
        // calculate the diameter and radius using the button
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        // set the remaining properties
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - (button.offsetLeft + radius)}px`;
        circle.style.top = `${event.clientY - (button.offsetTop + radius)}px`;
        // add the ripple class to the span element
        circle.classList.add("ripple"); 
        // check for existing ripples
        const ripple = button.getElementsByClassName("ripple")[0];
        if (ripple) {
        ripple.remove();
        }
        // add the span element
        button.appendChild(circle);
});
