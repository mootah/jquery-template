import $ from "jquery"

// Hamburger
const ham = $("#ham")
const menu = $("#menu")

const handleClickHam = () => {
  if (ham.hasClass("-js-open")) {
    ham.removeClass("-js-open")
    menu.removeClass("-js-open")
  } else {
    ham.addClass("-js-open")
    menu.addClass("-js-open")
  }
}

ham.on("click", handleClickHam)
menu.on("click", handleClickHam)

// Scroll
const handleScroll = (e: JQuery.TriggeredEvent) => {
  const target = $(e.target).attr("href") || ""
  console.log(target)
  const top = $(target).position().top
  console.log(top)
  $("html").animate({ scrollTop: top - 64 }, 400, "swing")
}

$('a[href^="#"]').on("click", handleScroll)

// Footer
const year = new Date().getFullYear()
$("#year").text(year)
