// This file is used that any error comes from api are coming in this format , so we standarize the error and unserdtand in easy manner.

class ApiError extends Error {
    constructor(statusCode, message="Something went wrong", errors = [], stack = ""){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors
        

        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

module.exports =  {ApiError}