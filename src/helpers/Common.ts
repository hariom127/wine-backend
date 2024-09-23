'use strict'

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const generateRandomNumber = (digits: number): number => {
  const n: number = digits > 0 ? digits - 1 : 0
  return Math.floor(Math.random() * (9 * Math.pow(10, n))) + Math.pow(10, n)
}

const getStartAndEndOfDay = function (date = new Date()) {
  // Ensure the date is at the start of the day
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));

  // Clone the date object to get the end of the day
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));

  return {
    startOfDay,
    endOfDay
  };
}

const getCurrentMonthStartAndEnd = function () {
  const today = new Date();

  // Start of the current month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfMonthStart = new Date(startOfMonth.setHours(0, 0, 0, 0));

  // End of the current month
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const endOfMonthEnd = new Date(endOfMonth.setHours(23, 59, 59, 999));

  return {
    startOfMonthStart,
    endOfMonthEnd
  };
}


// exportFuns.arrayToObject = (arr) => {
//   var rv = {}
//   for (var i = 0; i < arr.length; ++i) rv[i] = arr[i]
//   return rv
// }

// exportFuns.arrayColumn = (dataArr, key) => {
//   var flags = [],
//     output = [],
//     l = dataArr.length,
//     i
//   for (i = 0; i < l; i++) {
//     if (flags[dataArr[i][key]]) continue
//     flags[dataArr[i][key]] = true
//     output.push(dataArr[i][key])
//   }
//   return output
// }

// exportFuns.groupByArray = (dataArr, key) => {
//   return dataArr.reduce((r, a) => {
//     r[a[key]] = [...(r[a[key]] || []), a]
//     return r
//   }, [])
// }

// exportFuns.generateRandomNumber = (digits) => {
//   var n = digits > 0 ? digits - 1 : 0
//   return Math.floor(Math.random() * (9 * Math.pow(10, n))) + Math.pow(10, n)
// }

// exportFuns.generateUniqueString = (digits) => {
//   var text = ''
//   var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
//   for (var i = 0; i < digits; i++) {
//     text += chars.charAt(Math.floor(Math.random() * chars.length))
//   }
//   return text
// }

// exportFuns.checkForHexRegExp = (uniqueId) => {
//   var checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$')
//   return checkForHexRegExp.test(uniqueId) ? true : false
// }

// exportFuns.getUniqueIncrementedNumber = () => {
//   return Math.floor(Date.now() / 1000)
// }

// exportFuns.getUniqueIncrementedString = (prefix = '') => {
//   var string = prefix
//   string += Math.floor(Date.now() / 1000)
//   var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
//   for (var i = 0; i < 2; i++) {
//     string += chars.charAt(Math.floor(Math.random() * chars.length))
//   }
//   return string
// }

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

export { generateRandomNumber, getStartAndEndOfDay, getCurrentMonthStartAndEnd }
