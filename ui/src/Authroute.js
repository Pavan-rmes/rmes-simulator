import { Route } from "react-router-dom";
import { Login } from "./components/Login";
import { useHistory } from "react-router";

export function AuthRoute(props) {
    const history = useHistory()
  // console.log(props,localStorage.getItem("email"));
  const[,email]= decodeURIComponent(document.cookie).split("=")
  if (email) {
    return <Route exact path={props.path}>{props.children}</Route>;
  } else {
    history.push("/login")
    return <></>;
  }
}

export function assetTypes(){
  const[,email]= decodeURIComponent(document.cookie).split("=")
  if(email === "bhanu@sim.com"){
    return [{assetType:"Transformer",assets:[{name:"Transformer-1",port:100},{name:"Transformer-2",port:101},{name:"Transformer-3",port:102},{name:"Transformer-4",port:103}]},
      {assetType:"Cable",assets:[{name:"Cable-1",port:110}]}]
  }
  else if(email  ==="ravi@sim.com"){
    return [{assetType:"Transformer",assets:[{name:"Transformer-1",port:200},{name:"Transformer-2",port:201},{name:"Transformer-3",port:202},{name:"Transformer-4",port:203}]}]
  }
  else if(email  ==="prema@sim.com"){
    return [{assetType:"Transformer",assets:[{name:"Transformer-1",port:300},{name:"Transformer-2",port:301},{name:"Transformer-3",port:302},{name:"Transformer-4",port:303}]}]
  }
  else if(email  ==="tabish@sim.com"){
    return [{assetType:"Transformer",assets:[{name:"Transformer-1",port:400},{name:"Transformer-2",port:401},{name:"Transformer-3",port:402},{name:"Transformer-4",port:403}]}]
  }
  else if(email  ==="system@sim.com"){
    return [{assetType:"Transformer",assets:[{name:"Transformer-1",port:500},{name:"Transformer-2",port:501},{name:"Transformer-3",port:502},{name:"Transformer-4",port:503}]}]
  }
  else{
    return []
  }
}