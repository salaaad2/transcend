// import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
class Utils {


    getBase64(file: any | undefined) {
      if (!file)
        return ;
        return new Promise(resolve => {
    
          let baseURL: any = "";
          let reader = new FileReader();
    
          reader.readAsDataURL(file);
          reader.onload = () => {
            baseURL = reader.result;
            resolve(baseURL);
          };
        });
      };

    updateDomElement(oldEl: string, typeEl: string, idEl: string,
                     classnameEl: string, parent: string) {
        document.getElementById(oldEl)?.remove();
        const newEl = document.createElement(typeEl);
        newEl.id = idEl;
        newEl.className = classnameEl;
        document.getElementById(parent)?.appendChild(newEl);
    }

    notifyErr(msg: string) {
        toast.error(msg, {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    }

    notifyInfo(msg: string) {
        toast(msg,  {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    }

    notifySuccess(msg: string) {
        toast.success(msg,  {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    }
}

export default new Utils()
