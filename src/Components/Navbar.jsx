import React from "react";
import axios from "axios";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faShoppingBag, faHeart, faUser, faSearchLocation, faBars } from '@fortawesome/free-solid-svg-icons';

export default class Navbar extends React.Component{
    state = {
        cart: null
    }

    componentDidMount(){
        this.getUserCart()
    }

    getUserCart = () => {
        axios.get(`http://localhost:2000/carts?userID=${localStorage.getItem('id')}`)
        .then(res => {
            let cartTotal = 0
            res.data.forEach((value, index) => {
                cartTotal += value.quantity
            })
            this.setState({cart: cartTotal})
        })
        .then(err => {
            console.log(err)
        })
    }
    
    render(){
        return(
            <div className="bg-info">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-2">
                            <h3 onClick={() => {window.location = '/'}} >FE Test</h3>
                        </div>
                        <div className="col-4">
                            <span onClick={() => { window.location = `/transaction-history/${localStorage.getItem('id')}`}} >Transaction History</span>
                        </div>
                        <div className="col-6">
                            {
                                localStorage.getItem('id')?
                                    <>
                                        {
                                            this.state.cart? 
                                                <span className="mx-2" onClick={() => { window.location = `/user-cart/${localStorage.getItem('id')}` }} >
                                                    Total Cart: {this.state.cart}
                                                </span>
                                                :
                                                null
                                        }
                                        <span className="mx-2">{localStorage.getItem('email')}</span>
                                        <span className="mx-2" onClick={() => {localStorage.clear(); window.location = '/'}} > / Logout</span>
                                    </>
                                    :
                                    <span className="mx-2" onClick={() => {window.location = '/login'}} >Login</span>
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}