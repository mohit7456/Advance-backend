// This file is used that any response send to user which goes thought and follow this format , so we standarize the response.

class ApiResponse {
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400                  
    }
}

