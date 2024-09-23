const AppConstant = {
    "BRAND_CONSTANT": "https://cdn-icons-png.flaticon.com/512/2309/2309439.png",

    "SHOP_IMG": "https://cdn-icons-png.flaticon.com/512/869/869636.png",

    REGEX: {
        COUNTRY_CODE: /^(?:\+|\d)(\d{0,4})$/,
        COUNTRY_ABBREVIATION: /^[A-Z]{2,3}$/,
        MOBILE_NUMBER: /^\d{6,16}$/,
        REELS_MOBILE_NUMER: /^[0-9]{5,13}$/,
        STRING_REPLACE: /[-+ ()*_$#@!{}|\/^%`~=?,.<>:;'"]/g,
        SEARCH: /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,
        MONGO_ID: /^[a-f\d]{24}$/i,
        VENDOR_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,128}$/, // aA1
        ADDRESS: /^(?!\s)[\s\S]{0,50}(?<!\s)$/, // address regex.]
        VENDOR_EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    },

    SORT: {
        ASC: 1,
        DESC: -1
    },

    SHORT_QTY: 100
}

export { AppConstant }