import axios, { AxiosResponse } from "axios";
import log4js from "log4js";
const log = log4js.getLogger("utils:axios");
log.level = "info";

// Define the generic interface for the response data type
interface ResponseData<T> {
  data: T;
}

// Define the generic function for Axios requests
export async function axiosReq<T>(
  url: string,
  method: string,
  data?: any,
  headers?: object
): Promise<T> {
  try {
    const options = {
      url,
      method,
      data,
      headers,
    };

    const response: AxiosResponse<ResponseData<T>> = await axios(options);
    log.info("🌷 axios response status:", response.status);
    log.info("⭐ axios response data:", response.data);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Axios-specific error handling
      log.error("axios error message:", error.message);
      log.error("axios error config:", error.config);
      if (error.response) {
        log.error("axios error response data:", error.response.data);
        log.error("axios error response status:", error.response.status);
        log.error("axios error response headers:", error.response.headers);
      }
      throw new Error(`axios request error: ${error.message}`);
    } else {
      // Generic error handling
      log.error("generic error:", error);
      throw new Error("axios request error");
    }
  }
}
