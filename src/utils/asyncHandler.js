// The task is to that we know there is a function which we need again and again , so want that we gave him a function then it take our 
// function and send it outcome, so what we have do we make a function and plly wrapper(another function) which take function
// as a parameter, so it can take our function to that inner function.

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).
        catch((err) => next(err))
    }
}


module.exports = { asyncHandler }

/* Using try - catch

const asyncHandler = (fn) => async(req, res, next) => {      // () => () => {}
    try {
        await fn(req, res, next)
    } catch (error) {
        req.status(err.code || 500).json({
            success: false,
            message: err.message
        })
    }
}

*/