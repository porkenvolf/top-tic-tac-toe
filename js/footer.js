const currentYearTag = document.querySelector("#currentYear");
const currentYear = new Date().getFullYear();
const firstYearTag = document.querySelector("#firstYear");
if (!firstYearTag.innerHTML.includes(currentYear)) {
    currentYearTag.innerHTML = currentYear + " - ";
}

{
    /* 
<footer>
    <small>
        &copy; Copyright <span id="firstYear">2023</span> -
        <span id="currentYear"></span>
        <a href="https://github.com/porkenvolf" target="”_blank”">
            Porkenvölf
        </a>
    </small>
</footer> 
    */
}
