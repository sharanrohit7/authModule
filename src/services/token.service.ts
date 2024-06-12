import axios from 'axios';

interface SignTokenResponse {
  token?: string;
  error?: string;
}

const baseUrl:string = process.env.TOKEN_URL || "localhost:3000"


export const signToken = async ( id: string, roleId: string): Promise<SignTokenResponse> => {
  try {
    const url:string = `${baseUrl}/signToken`
    const response = await axios.post(url, {}, {
      headers: {
        'id': id,
        'role_id': roleId
      }
    });

    if (response.status === 200) {
      console.log('Token received:', response.data.token);
      return { token: response.data.token };
    } else {
      console.error('Unexpected response status:', response.status);
      return { error: 'Unexpected response status' };
    }
  } catch (error) {
    console.error('Error posting request:', error);
    if (axios.isAxiosError(error) && error.response) {
      // If the error is from the server response
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      return { error: error.response.data.error };
    } else {
      // If the error is something else (e.g., network error)
      return { error: 'An error occurred while making the request' };
    }
  }
};


export const verifyToken = async(token:string) =>{
    try {
        if(token === undefined || token === "" || !token){
            return "Token not found"
        }
        const url:string = `${baseUrl}/verify`
        const response = await axios.post(url, {}, {
            headers: {
              'Authorization': token
            }
          });
        if(response.status ===200){
          console.log(response);
          
            return response
        }
        if(response.status === 401){
          console.log("401");
          
            return "Invalid token"
        }
        if(response.status ===400){
            return "token not provided"
        }
    } catch (error:any) {
      if (error.message == "Request failed with status code 401"){
        return "Invalid token"
      }
     return error  
    }
    }