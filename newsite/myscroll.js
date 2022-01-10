window.onload = function() {scrollFunction()};
window.onresize = function() {scrollFunction()};
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        document.getElementById("navbar").classList.remove('nobg');
    } else {
        if (!document.getElementById("navbarNav").classList.contains("show")) {
            document.getElementById("navbar").classList.add('nobg');
        }
    }
}

function showBg() {
    document.getElementById("navbar").classList.remove('nobg');
    if (document.body.scrollTop <= 20 && document.documentElement.scrollTop <= 20) {
        if (document.getElementById("navButton").classList.contains("collapsed")) {
            document.getElementById("navbar").classList.add('nobg');
        } 
    }
}
