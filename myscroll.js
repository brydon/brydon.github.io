window.onload = function() {scrollFunction()};
window.onresize = function() {scrollFunction()};
window.onscroll = function() {scrollFunction()};

var pix_thresh = 20;

function scrollFunction() {
    if (document.body.scrollTop > pix_thresh || document.documentElement.scrollTop > pix_thresh) {
        document.getElementById("navbar").classList.remove('nobg');
    } else {
        if (!document.getElementById("navbarNav").classList.contains("show")) {
            document.getElementById("navbar").classList.add('nobg');
        }
    }
}

function showBg() {
    document.getElementById("navbar").classList.remove('nobg');
    if (document.body.scrollTop <= pix_thresh && document.documentElement.scrollTop <= pix_thresh) {
        if (document.getElementById("navButton").classList.contains("collapsed")) {
            document.getElementById("navbar").classList.add('nobg');
        } 
    }
}
