import React from "react";

import { useState } from "react";

import logo from './Images/Logo.png'

export const AccountModal = ( {submitHandler, errorMessage, setErrorMessage} ) => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hasExistingAccount, setHasExistingAccount] = useState(true);

  function handleLogin() {
    submitHandler(hasExistingAccount, username, password);
  }

  if(hasExistingAccount) {
    return (
      <div className="modal account-modal">
        <div className="modal-content">
            <img src={logo} width="100%"></img>
            <p className="error-message" style={{ visibility: (errorMessage == ""? "hidden": "visible")}}>{errorMessage}</p>

            <div className="form-field">
                <p className="form-label">Username</p>
                <input value={username} onChange={ e => setUsername(e.target.value)} type="username" autoComplete="memorybook_username" placeholder="Username"></input>
            </div>

            <div className="form-field">
                <p className="form-label">Password</p>
                <input value={password} onChange={ e => setPassword(e.target.value)} type="password" placeholder="Password"></input>
            </div>

            <button className="wide-button yellow" onClick={handleLogin}>Log in</button>
            <button className="wide-button" onClick={ () => { setHasExistingAccount(false); setErrorMessage(""); }}>
              Don't have an account yet? Sign up
            </button>
        </div>
      </div>
    );
  }
  else {
    return (
      <div className="modal account-modal">
        <div className="modal-content">
            <img src={logo} width="100%"></img>
            
            <p className="error-message" style={{ visibility: (errorMessage == ""? "hidden": "visible")}}>{errorMessage}</p>
            <div className="form-field">
                <p className="form-label">What do you want us to call you?</p>
                <input value={name} onChange={ e => setName(e.target.value)} type="name" autoComplete="memorybook_firstname" placeholder="What is your name?"></input>
            </div>

            <div className="form-field">
                <p className="form-label">Choose a username</p>
                <input value={username} onChange={ e => setUsername(e.target.value)} type="name" autoComplete="memorybook_username" placeholder="Create your new username"></input>
            </div>

            <div className="form-field">
                <p className="form-label">New password</p>
                <input value={password} onChange={ e => setPassword(e.target.value)} type="password" placeholder="Choose a password"></input>
            </div>
            <button className="wide-button yellow" onClick={handleLogin}>Create account</button>
            <button className="wide-button" onClick={ () => { setHasExistingAccount(true); setErrorMessage(""); }}>
              Already have an account? Sign in
            </button>
        </div>
      </div>
    );
  }
};