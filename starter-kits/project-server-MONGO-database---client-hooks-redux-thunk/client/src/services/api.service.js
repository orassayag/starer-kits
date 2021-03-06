import axios from 'axios';

class APIService {

    constructor() {
        this.baseAPI = 'http://localhost:3001/api/movies/';
        const headers = {
            'content-type': 'application/json'
        };
        this.serverAPI = axios.create({
            headers: headers
        });
    }

    async getRequest(queryURL) {
        const responseResult = {
            response: null,
            error: null
        };
        const query = `${this.baseAPI}${queryURL}`;
        try {
            responseResult.response = await this.serverAPI.get(query);
        } catch (error) {
            if (error) {
                responseResult.error = error;
            }
        }
        return responseResult;
    }

    async postRequest(queryURL, request) {
        const responseResult = {
            response: null,
            error: null
        };
        const query = `${this.baseAPI}${queryURL}`;
        try {
            responseResult.response = await this.serverAPI.post(query, request);
        } catch (error) {
            if (error) {
                responseResult.error = error;
            }
        }
        return responseResult;
    }
}

export default new APIService();