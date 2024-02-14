/* global google */
import React from "react";
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
import { useState, useEffect } from 'react'
import jwt_decode from 'jwt-decode';
import { getConfig } from "./config";


// styles
import "./App.css";


// fontawesome
import initFontAwesome from "./utils/initFontAwesome";
initFontAwesome();

const App = () => {
const config = getConfig();
  const { isLoading, error, loginWithRedirect, isAuthenticated } = useAuth0();

  const onOneTapSignedIn = response => {
    const decodedToken = jwt_decode(response.credential)
          const opts = {
            login_hint: decodedToken.email,
            connection: "google-oauth2",
            scope: "openid email profile stepup:test"
          };
          loginWithRedirect(opts);
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

    useEffect(() => {
      const el = document.createElement('script')
      el.setAttribute('src', 'https://accounts.google.com/gsi/client')
      el.onload = () => initializeGSI();
      if (!isAuthenticated) {
        document.querySelector('body').appendChild(el)
      }
    }, [])



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
