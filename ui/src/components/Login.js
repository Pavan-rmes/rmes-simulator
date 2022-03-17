import { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import axios from "axios"


export function Login() {
  const history = useHistory()
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [errorMessg,setErrorMessg] = useState("")

  const d = new Date();
  d.setTime(d.getTime() + (24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  
  const db = [
    {email:"bhanu@sim.com",pass:"bhanu@rmes"},
    {email:"ravi@sim.com",pass:"ravi@rmes"},
    {email:"prema@sim.com",pass:"prema@rmes"},
    {email:"tabish@sim.com",pass:"tabish@rmes"},
    {email:"system@sim.com",pass:"system@rmes"},

  ]



  function loginButton(){
    const isValid = db.filter((cred)=>(cred.email ===email && cred.pass ===password ))[0]
    if(isValid){
      localStorage.setItem("email",email)
      document.cookie = `email=${email};${expires};`
      history.push("/assets")
    }
    else{
      setErrorMessg("Invalid Credentials")
    }
    
  }

  const[,cookieEmail]= decodeURIComponent(document.cookie).split("=")
  if (cookieEmail){
    history.push("/trafo")
  }
  return (
    <div className="mt-10 md:ml-96" style={{width:"500px"}}>
          <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col">
        <div class="mb-4">
          <label class="block text-grey-darker text-sm font-bold mb-2" for="username">
            Username
          </label>
          <input onInput={(event)=>{setEmail(event.target.value)}} class="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker" id="username" type="email" placeholder="Username" />
        </div>
        <div class="mb-6">
          <label class="block text-grey-darker text-sm font-bold mb-2" for="password">
            Password
          </label>
          <input onInput={(event)=>{setPassword(event.target.value)}} class="shadow appearance-none border border-red rounded w-full py-2 px-3 text-grey-darker mb-3" id="password" type="password" placeholder="******************" />
          <p class="text-red text-xs italic">Please choose a password.</p>
          <p style={{color:"red"}} >{errorMessg}</p>
        </div>
        
        <div class="flex items-center justify-between">
          <button onClick={()=>loginButton()} class="bg-blue-500 hover:bg-blue-dark-400 text-white font-bold py-2 px-4 rounded" type="button">
            Sign In
          </button>
        </div>
        </div>
    </div>
  );
}
