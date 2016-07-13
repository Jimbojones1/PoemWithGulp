console.log('javascript folder is loaded')

var submitButton = document.getElementById('submit')

submitButton.onclick = function(){
console.log('this was clicked')

}

var timer = setTimeout(checkForButton, 1000)

function checkForButton(){
  var submitButton = document.getElementById('submit');

  if(submitButton != null){
    submitButton.onclick = function(){
    console.log('this was clicked')
    clearInterval(timer)
    }
  }
}
