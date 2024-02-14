/* global google */
import React, { useState, useEffect } from "react";
import { Router, Route, Switch } from "react-router-dom";
import { Container } from "reactstrap";

import Loading from "./components/Loading";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./views/Home";
import Profile from "./views/Profile";
import ExternalApi from "./views/ExternalApi";
import { useAuth0 } from "@auth0/auth0-react";
import history from "./utils/history";
import jwt_decode from 'jwt-decode';
import { getConfig } from "./config";

// styles
import "./App.css";

// fontawesome
import initFontAwesome from "./utils/initFontAwesome";
initFontAwesome();

const App = () => {
    const { isLoading, error, loginWithRedirect, isAuthenticated, getIdTokenClaims } = useAuth0();
    const config = getConfig();

    const onOneTapSignedIn = response => {
      const decodedToken = jwt_decode(response.credential)

            loginWithRedirect({authorizationParams: {login_hint: decodedToken.email, connection: "google-oauth2"}});
    }

    const initializeGSI = () => {
      google.accounts.id.initialize({
        client_id: config.googleClientId,
        cancel_on_tap_outside: false,
        callback: onOneTapSignedIn
      });
      google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          console.log(notification.getNotDisplayedReason())
        } else if (notification.isSkippedMoment()) {
          console.log(notification.getSkippedReason())
        } else if(notification.isDismissedMoment()) {
          console.log(notification.getDismissedReason())
        }
      });
    }

    useEffect(()=>{

        const el = document.createElement('script')
        el.setAttribute('src', 'https://accounts.google.com/gsi/client')
        el.onload = () => initializeGSI();
        console.log(isAuthenticated);
        if (!isAuthenticated) {
          console.log("herekj");
          document.querySelector('body').appendChild(el)
        }
        if (isAuthenticated) {
        getIdTokenClaims().then(

          (t) => {

            // if the remember me claim is present then set a local storage flag and reload the app with the amended auth provider
            if (t.remember_me == "true" && localStorage.remember_me!=='true' && localStorage.reload!=='true') {
              localStorage.setItem("remember_me", "true");
              localStorage.setItem("reload", "true");
              loginWithRedirect({authorizationParams: {prompt: "none"}});
            } else if (localStorage.remember_me=='true' && localStorage.reload=='true') {
                 // reload the app now that our new auth provider settings are in place
                 localStorage.removeItem("reload");
                 loginWithRedirect({authorizationParams: {prompt: "none"}});
            }
          }
        );
        } else {
            //remove the remember me flag on logout
            if (localStorage.remember_me=='true' && localStorage.reload!=='true') {
                localStorage.removeItem("remember_me");
            }
        }
      }, []);

  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isLoading) {
    return <Loading />;
  }

  if (isAuthenticated) {
      try {
     document.getElementById("credential_picker_container").remove();
      } catch(err) {}
  }

  return (
    <Router history={history}>
      <div id="app" className="d-flex flex-column h-100">
        <NavBar />
        <Container className="flex-grow-1 mt-5">
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/profile" component={Profile} />
            <Route path="/external-api" component={ExternalApi} />
          </Switch>
        </Container>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
