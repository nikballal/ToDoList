//jshint esversion:6

//functions can be assigned a variable.  e.g var getDate = function() {}

exports.getDate = function () {
  //module.exports can just be written as exports
  const today = new Date()

  const options = {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }

  return (day = today.toLocaleDateString('en-US', options))
}

exports.getDay = function () {
  const today = new Date()

  const options = {
    weekday: 'long',
  }

  return (day = today.toLocaleDateString('en-US', options))
}

console.log(module.exports)
