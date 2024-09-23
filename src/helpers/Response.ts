
/**
 * @desc    Send any success response
 * @param   {string} message
 * @param   {object | array} results
 * @param   {number} statusCode
 */
const success = (message: string, results: any, statusCode: number) => {


    return {
        code: statusCode,
        message,
        results: results || {}
    };
};

export {
    success
}