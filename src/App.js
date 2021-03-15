import React, { Component } from 'react'
import { BrowserRouter, Switch, Link, Route, Redirect } from "react-router-dom";

import Navbar from "./Components/Navbar";
import LandingPage from "./Pages/LandingPages";
import Login from "./Pages/Login";
import AddToCart from "./Pages/AddToCart";
import UserCart from "./Pages/UserCart";
import TransactionHistory from "./Pages/TransactionHistory";

export default class App extends React.Component{
  render(){
    return(
      <div>
        <Navbar/>
        <BrowserRouter>
          <Switch>
            <Route exact path='/' component={LandingPage} />
            <Route path='/product-detail/:ProductID' component={AddToCart} />
            <Route path='/user-cart/:userID' component={UserCart} />
            <Route path='/transaction-history/:transactionID' component={TransactionHistory} />
            <Route path='/login'>
                {
                  localStorage.getItem('id')?
                    <Redirect to='/' />
                    :
                    <Login />
                }  
            </Route>
          </Switch>
        </BrowserRouter>
      </div>
    )
  }
}