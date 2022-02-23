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