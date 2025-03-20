import axios from "axios";
import Swal from "sweetalert2";


const axiosInstance = axios.create({
    baseURL : 'http://localhost:3008',
    timeout : 10000,
    headers : {
        "Content-Type" : 'application/json'
    }
})
axiosInstance.interceptors.response.use(
    (response)=>response.data,
    (error)=>{
        let interceptorError = {}
         if(error.status == 404){
                        Swal.fire({
                            title : 'Server Error',
                            icon : 'error',
                            toast : true,
                            timer : 3000,
                            showConfirmButton : false,
                            position : 'bottom-end'
                        })
                        
        }else{
            interceptorError = {message : error.response.data.message}
        }
        return Promise.reject(interceptorError)}
)

export default axiosInstance