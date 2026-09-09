// Direct pages use native links and details, and remain usable without JavaScript.
if(document.querySelector('.prose')?.textContent.includes('\\(')){
 window.MathJax={tex:{inlineMath:[['\\(','\\)']]},options:{skipHtmlTags:['script','noscript','style','textarea','pre','code']}};
 const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-chtml.js';script.async=true;document.head.append(script);
}
